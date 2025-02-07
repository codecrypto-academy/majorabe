# Proyecto: Configuración de Bases de Datos en Docker

## Objetivos

- **Instalar contenedores Docker para las siguientes bases de datos**:
  - MySQL
  - SQL Server
  - Oracle
  - PostgreSQL

- **Cargar los datos de la base de datos Northwind** en cada sistema.
- **Desarrollar un servidor web** que acceda y gestione las distintas bases de datos.

---------------------------------------------------------------------------------------

## 1. Configuración de MySQL
1.1 Creo el contenedro con Mysql
```bash
docker run --name curso-pg -e POSTGRES_PASSWORD=majo1234 -p 5437:5432 -d postgres:13
```
1.2 Corro el script de MYSQL de northwin desde DBeaver para completar la base de datos. 
1.3 preparo el proyecto en vsc para leer la base
```bash
yarn add mysql8
```
---------------------------------------------------------------------------------------

## 2. Configuración de Postgresql
2.1 Creo el contenedor
```bash
docker run --name proyPostgres -e POSTGRES_PASSWORD=Majo1234 -p 5433:5432 -d postgres:13 
```bash
2.2 Corro el script de MYSQL de northwin desde DBeaver para completar la base de datos. 
2.3 preparo el proyecto en vsc para leer la base
```bash
yarn add pg
```
---------------------------------------------------------------------------------------

## 3. Configuración de MySQLServer
3.1 Creo el contenedor 
```bash
docker run --name sqlServer -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=Majo1234" -p 1433:1433 -d mcr.microsoft.com/mssql/server:2019-CU15-ubuntu-20.04
```
3.2 Corro el scriptde SQLSERVER de northwin desde DBeaver para completar la base de datos. 
3.3 preparo el proyecto en vsc para leer la base
```bash
yarn add mssql
```
-----------------------------------------------------------------------------------------

## 4. Configuración de Oracle
4.1 Creo el contenedor
```bash
docker run -d --name oracle -e ORACLE_PWD=majo1234 -p 1521:1521 container-registry.oracle.com/database/express:21.3.0-xe
```
4.2 Corro el scriptde Oracle de northwin desde DBeaver para completar la base de datos. 

4.3 Preparo el proyecto en vsc para leer la base
* Se requiere descargar el cliente de Oracle. Para este caso se uso Basic Light Package
```bash 
yarn add oracledb
```
--------------------------------------------------------------------------------------------
