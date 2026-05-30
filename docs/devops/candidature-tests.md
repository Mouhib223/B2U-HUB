# Plan de tests DevOps - module candidature

Ce plan limite le perimetre aux fichiers et endpoints de candidature pour eviter de modifier les autres entites.

## Tests unitaires

Front Angular:

```bash
ng test --include "src/app/core/services/candidature.service.spec.ts" --watch=false --browsers=ChromeHeadless
```

Back Spring Boot:

```bash
mvn -Dtest=CandidatureServiceTest test
```

## Tests fonctionnels

Front Angular:

```bash
ng test --include "src/app/features/candidatures/candidature-form.spec.ts" --watch=false --browsers=ChromeHeadless
```

Back Spring Boot:

```bash
mvn -Dtest=CandidatureControllerFunctionalTest test
```

## Test statique SonarQube

Les fichiers de configuration sont:

- Front: `B2U-HUB/sonar-project.properties`
- Back: `B2U_backend/sonar-project.properties`

Front, scope candidature uniquement:

```bash
cd B2U-HUB
sonar-scanner
```

Back, scope candidature uniquement:

```bash
cd B2U_backend
mvn test sonar:sonar
```

## Test OWASP bibliotheques dans SonarQube

Generer les rapports OWASP Dependency-Check, puis les envoyer a SonarQube.

Front:

```bash
npm audit --omit=dev
dependency-check --project "b2u-front-candidature" --scan package-lock.json --format JSON --out reports/owasp/front
sonar-scanner -Dsonar.dependencyCheck.jsonReportPath=reports/owasp/front/dependency-check-report.json
```

Back:

```bash
mvn org.owasp:dependency-check-maven:check -Dformat=ALL -DoutputDirectory=target/dependency-check
mvn sonar:sonar -Dsonar.dependencyCheck.jsonReportPath=target/dependency-check/dependency-check-report.json
```

## Test dynamique OWASP ZAP

Le fichier Docker pour lancer l'application avant le scan est:

```bash
docker-compose.zap-candidature.yml
```

Avant de lancer ZAP, construire le jar backend:

```bash
cd B2U_backend
mvn clean package -DskipTests
```

Demarrer le front, le back et MongoDB:

```bash
cd ..
docker compose -f docker-compose.zap-candidature.yml up --build -d mongodb backend frontend
```

Scanner uniquement les parcours candidature:

```bash
docker compose -f docker-compose.zap-candidature.yml --profile zap run --rm zap-back
docker compose -f docker-compose.zap-candidature.yml --profile zap run --rm zap-front
```

Les rapports a joindre dans le rendu DevOps sont: resultats unitaires, resultats fonctionnels, rapport SonarQube, rapport OWASP Dependency-Check et rapport OWASP ZAP.
