import * as pulumi from "@pulumi/pulumi";
import * as azure from "@pulumi/azure-native";

// Variables de configuración
const project = process.env.PROJECT || "aziacproj";
const env = process.env.ENVIRONMENT || "dev";
const appServiceNameSuffix = process.env.APP_SERVICE_NAME_SUFFIX || "001";
const storageAccountSuffix = process.env.STORAGE_ACCOUNT_SUFFIX || "001";

// Generar nombres de recursos
const resourceGroupName = `${project}-rg-${env}-${appServiceNameSuffix}`;
const appServicePlanName = `${project}-asp-${env}-${appServiceNameSuffix}`;
const microservices = [
    { name: "appNameGen", index: "001" },
    { name: "appNameGen", index: "002" },
    { name: "appNameGen", index: "003" }
];

// Crear un grupo de recursos
const resourceGroup = new azure.resources.ResourceGroup(resourceGroupName, {
    resourceGroupName: resourceGroupName,
    location: "East US",
});

// Crear un plan de servicio de aplicaciones
const appServicePlan = new azure.web.AppServicePlan(appServicePlanName, {
    resourceGroupName: resourceGroup.name,
    name: appServicePlanName,
    sku: {
        name: "B1", // Tier Básico
        tier: "Basic",
        size: "B2",
    },
    kind: "App",
    location: resourceGroup.location,
});

// Crear aplicaciones
const appServices = microservices.map((microservice) => {
    return new azure.web.WebApp(`${microservice.name}-${microservice.index}`, {
        name: `${microservice.name}${microservice.index}`,
        resourceGroupName: resourceGroup.name,
        serverFarmId: appServicePlan.id,
        httpsOnly: true,
        kind: "app",
        location: resourceGroup.location,
        identity: {
            type: "SystemAssigned",
        },
        tags: {
            microservice: microservice.name,
        },
    });
});

// Crear una cuenta de almacenamiento
const storageAccountName = `${project}st${storageAccountSuffix}`;
const storageAccount = new azure.storage.StorageAccount(storageAccountName, {
    name: storageAccountName,
    resourceGroupName: resourceGroup.name,
    sku: {
        name: "Standard_LRS",
    },
    kind: "StorageV2",
    location: resourceGroup.location,
});

// Crear un contenedor en la cuenta de almacenamiento si no existe
const container = new azure.storage.BlobContainer(`${storageAccountName}-container`, {
    resourceGroupName: resourceGroup.name,
    accountName: storageAccount.name,
    containerName: "images",
}, {
    ignoreChanges: ["containerName"]
});

// Crear asignaciones de roles
const appServicesDataContributorAssignment = appServices.map((appService, index) => {
    return appService.identity.apply(identity => {
        return new azure.authorization.RoleAssignment(`role-assignment-${project}-${appService.name}${index}`, {
            principalId: identity.principalId,
            principalType: "ServicePrincipal",
            roleDefinitionName: "Storage Blob Data Contributor",
            roleDefinitionId: "/providers/Microsoft.Authorization/roleDefinitions/ba92f5b4-2d11-453d-a403-e96b0029c9fe",
            scope: storageAccount.id,
        });
    });
});


export const AppserviceUrls = pulumi.all(appServices.map(appService => appService.defaultHostName)).apply(hostnames => hostnames.join(","));

