# Despliegue en AWS Amplify con GitHub Actions

Cómo está montado el despliegue y qué hay que configurar una sola vez en AWS y en GitHub.

## Cómo funciona

1. Cada push o pull request ejecuta el job **Tests** de `.github/workflows/ci-cd.yml`:
   - sintaxis de `js/*.js` con `node --check`;
   - HTML válido con `html-validate` (configuración en `.htmlvalidate.json`).
2. Un push a `main` con los tests en verde ejecuta **Deploy to Amplify**:
   - empaqueta solo la web (`index.html`, `css`, `js`, `assets`) en `site.zip`;
   - pide a AWS credenciales temporales por **OpenID Connect (OIDC)** asumiendo un rol IAM, así que no hay claves de AWS guardadas en GitHub;
   - crea un despliegue en Amplify, sube el zip, lo inicia y espera a que termine;
   - escribe la URL en vivo en el resumen del workflow.
3. Mientras no existan las variables del paso 4, el job de despliegue se salta y los tests siguen funcionando.

Servicios de AWS: **Amplify Hosting** (la web) e **IAM** (proveedor OIDC y rol con el mínimo permiso). IAM no tiene coste.

## Configuración (una vez)

Usa la misma región de AWS en todos los pasos (por ejemplo `eu-west-1`, Irlanda).

### 1. Crear la app en Amplify sin conectar Git

1. Consola de AWS → **AWS Amplify** → **Create new app** → **Deploy without Git**.
2. Nombre de la app: `CanaryPortfolioJoel`. Nombre del entorno (rama): **`main`**.
3. Sube el zip de la web. Se crea en la raíz del proyecto con:
   ```powershell
   New-Item -ItemType Directory -Force dist; Copy-Item -Recurse index.html, css, js, assets dist; Compress-Archive -Path dist\* -DestinationPath site.zip -Force
   ```
4. Guarda el **App ID** (empieza por `d`, aparece en *App settings → General*).

### 2. Proveedor de identidad OIDC de GitHub

IAM → **Identity providers** → **Add provider**:

- Tipo: **OpenID Connect**
- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

(Si ya existe en la cuenta, no lo crees otra vez.)

### 3. Rol IAM para el despliegue

IAM → **Roles** → **Create role** → **Web identity** → proveedor `token.actions.githubusercontent.com`, audience `sts.amazonaws.com`. Después, en *Trust relationships*, deja esta política (cambia `ACCOUNT_ID`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com" },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
          "token.actions.githubusercontent.com:sub": [
            "repo:YoelRuso@116205447/CanaryPortfolioJoel@1447465204:environment:production",
            "repo:YoelRuso/CanaryPortfolioJoel:environment:production"
          ]
        }
      }
    }
  ]
}
```

La condición `sub` hace que solo el entorno `production` de este repositorio pueda asumir el rol. Este repo usa el formato nuevo de GitHub, que incluye los IDs numéricos de la cuenta y del repo (`repo:YoelRuso@116205447/CanaryPortfolioJoel@1447465204:...`); se acepta también el formato clásico. Para ver qué formato usa un repo:

```bash
gh api repos/YoelRuso/CanaryPortfolioJoel/actions/oidc/customization/sub
```

Añade al rol esta política de permisos en línea (cambia `REGION`, `ACCOUNT_ID` y `APP_ID`). Solo permite desplegar en la rama `main` de esta app:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DeployPortfolio",
      "Effect": "Allow",
      "Action": ["amplify:CreateDeployment", "amplify:StartDeployment", "amplify:GetJob", "amplify:GetApp"],
      "Resource": [
        "arn:aws:amplify:REGION:ACCOUNT_ID:apps/APP_ID",
        "arn:aws:amplify:REGION:ACCOUNT_ID:apps/APP_ID/branches/main",
        "arn:aws:amplify:REGION:ACCOUNT_ID:apps/APP_ID/branches/main/deployments/*",
        "arn:aws:amplify:REGION:ACCOUNT_ID:apps/APP_ID/branches/main/jobs/*"
      ]
    }
  ]
}
```

Nombre sugerido del rol: `github-actions-portfolio-deploy`. Copia su **ARN**.

### 4. Variables en GitHub

Repositorio → **Settings → Secrets and variables → Actions → Variables** → *New repository variable*:

| Variable | Valor |
|---|---|
| `AWS_REGION` | la región, p. ej. `eu-west-1` |
| `AMPLIFY_APP_ID` | el App ID del paso 1 |
| `AWS_ROLE_ARN` | el ARN del rol del paso 3 |

No son secretos: ninguno permite actuar sin el token OIDC que solo emite GitHub para este repositorio.

### 5. Probar

**Actions → CI/CD → Run workflow** sobre `main`, o un push a `main`. El resumen del job muestra la URL en vivo (`https://main.<id>.amplifyapp.com`).

## Si falla

- **Not authorized to perform sts:AssumeRoleWithWebIdentity**: revisa la condición `sub` (formato con IDs o clásico, nombre exacto del repo y `environment:production`) y el ARN del proveedor. Fue el primer fallo real de este proyecto: la política solo tenía el formato clásico.
- **AccessDenied en amplify:...**: revisa región, App ID y que la rama de Amplify se llame `main`. `CreateDeployment` actúa sobre `branches/main/deployments/*`, así que ese recurso tiene que estar en la política (faltaba en la primera versión).
- **El job de despliegue aparece como saltado**: falta la variable `AMPLIFY_APP_ID`, o el push no fue a `main`.
