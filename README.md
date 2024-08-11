**Proyecto:** Implementación de Arquitectura en Azure con Pulumi

Este proyecto implementa una solución en Azure utilizando Pulumi, basada en un diagrama de arquitectura.
Requisitos

    Node.js (v18+)
    Pulumi
    Cuenta de Azure
    Azure CLI

**Variables de Configuración**

    PROJECT: Nombre del proyecto (por defecto: aziacproj)
    ENVIRONMENT: Entorno de despliegue (por defecto: dev)
    APP_SERVICE_NAME_SUFFIX: Sufijo para nombres de App Services (por defecto: 001)
    STORAGE_ACCOUNT_SUFFIX: Sufijo para el nombre de la Storage Account (por defecto: 001)

**Configura Variables de entorno**

export PROJECT="tuProyecto"
export ENVIRONMENT="dev"

**Instalar dependencias**
npm install

**Construir la Infraestructura**
pulumi up

**Recursos Desplegados**

    Grupo de recursos en Azure
    Plan de App Service
    Tres aplicaciones web (WebApp)
    Cuenta de almacenamiento con contenedor
    Asignaciones de roles para acceso a blobs

**Salida**

La URL de las aplicaciones se mostrará después del despliegue.

