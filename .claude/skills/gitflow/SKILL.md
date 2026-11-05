---
name: gitflow
description: Crea, cierra y publica ramas de este proyecto siguiendo Gitflow y sus convenciones de nombres y commits. Úsala al empezar o terminar una feature, una release o un hotfix, y antes de cualquier commit.
---

# Gitflow del proyecto

Usa git normal: la extensión `git flow` no está instalada ni hace falta. Comprueba siempre la rama y el estado con `git status` antes de actuar.

## Nombres

| Rama | Sale de | Vuelve a | Ejemplo |
|---|---|---|---|
| `feature/<kebab-case>` | `develop` | `develop` | `feature/about-section` |
| `release/<x.y.z>` | `develop` | `main` y `develop` | `release/1.0.0` |
| `hotfix/<kebab-case>` | `main` | `main` y `develop` | `hotfix/fix-mobile-nav` |

Nunca hagas commits directamente en `main` ni en `develop`, salvo los merges de este procedimiento.

## Commits

Formato: `tipo(ámbito): descripción`, en inglés, en imperativo y sin punto final.

Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`.

Prohibido incluir `Co-Authored-By`, "Generated with" o cualquier otra atribución a Claude. Añade los archivos por nombre y comprueba que no vayan credenciales.

## Feature

```bash
git switch develop
git switch -c feature/<nombre>
# commits...
git switch develop
git merge --no-ff feature/<nombre> -m "merge: feature/<nombre> into develop"
git branch -d feature/<nombre>
```

## Release

Antes de cerrarla, ejecuta `/submission-check`.

```bash
git switch develop
git switch -c release/<x.y.z>
# solo ajustes finales...
git switch main
git merge --no-ff release/<x.y.z> -m "merge: release/<x.y.z> into main"
git tag -a v<x.y.z> -m "Release <x.y.z>"
git switch develop
git merge --no-ff release/<x.y.z> -m "merge: release/<x.y.z> into develop"
git branch -d release/<x.y.z>
```

## Hotfix

```bash
git switch main
git switch -c hotfix/<nombre>
# corrección...
git switch main
git merge --no-ff hotfix/<nombre> -m "merge: hotfix/<nombre> into main"
git tag -a v<x.y.z> -m "Hotfix <x.y.z>"
git switch develop
git merge --no-ff hotfix/<nombre> -m "merge: hotfix/<nombre> into develop"
git branch -d hotfix/<nombre>
```

## Publicar

Haz `git push` solo cuando Joel lo pida. Un push a `main` despliega en producción con Amplify, así que avísalo antes. Para los tags, usa `git push origin main develop --tags`.

Si hay un conflicto de merge, enséñaselo a Joel antes de resolver algo que no sea evidente.
