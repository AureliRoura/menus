// Nombres de las bases de datos de origen y destino
const sourceDBName = 'menudb';
const targetDBName = 'menudb_backup';

// Obtener la lista de colecciones de la base de datos de origen
const sourceDB = db.getSiblingDB(sourceDBName);
const targetDB = db.getSiblingDB(targetDBName);

const collections = sourceDB.getCollectionNames();

collections.forEach(collectionName => {
  // Obtener todos los documentos de la colección de origen
  const documents = sourceDB.getCollection(collectionName).find().toArray();

  // Insertar documentos en la colección de destino
  if (documents.length > 0) {
    targetDB.getCollection(collectionName).insertMany(documents);
  }

  print(`Colección '${collectionName}' copiada de '${sourceDBName}' a '${targetDBName}'`);
});

print('Copia de base de datos completada');
