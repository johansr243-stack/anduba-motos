// Copia TODAS las colecciones de una base de datos MongoDB a otra.
// Sirve para crear (o reiniciar) la base de datos de la demo a partir
// de la base de desarrollo.
//
// Uso (desde la carpeta backend):
//   node scripts/copy-database.js "<URI_ORIGEN>" "<URI_DESTINO>"
//
// Las URIs deben incluir el nombre de la base de datos al final, ej:
//   mongodb+srv://usuario:clave@cluster0.xxxx.mongodb.net/Ecommerce
//
// OJO: borra el contenido de las colecciones en el DESTINO antes de copiar.

import mongoose from "mongoose";

const [sourceUri, targetUri] = process.argv.slice(2);

if (!sourceUri || !targetUri) {
  console.error('Uso: node scripts/copy-database.js "<URI_ORIGEN>" "<URI_DESTINO>"');
  process.exit(1);
}

if (sourceUri === targetUri) {
  console.error("El origen y el destino no pueden ser la misma base de datos.");
  process.exit(1);
}

const BATCH_SIZE = 500;

const main = async () => {
  const source = await mongoose.createConnection(sourceUri).asPromise();
  const target = await mongoose.createConnection(targetUri).asPromise();

  console.log(`Origen:  ${source.name}`);
  console.log(`Destino: ${target.name}\n`);

  const collections = await source.db.listCollections({}, { nameOnly: true }).toArray();

  for (const { name } of collections) {
    if (name.startsWith("system.")) continue;

    const sourceCollection = source.db.collection(name);
    const targetCollection = target.db.collection(name);

    await targetCollection.deleteMany({});

    let batch = [];
    let total = 0;

    for await (const doc of sourceCollection.find()) {
      batch.push(doc);
      if (batch.length === BATCH_SIZE) {
        await targetCollection.insertMany(batch);
        total += batch.length;
        batch = [];
      }
    }

    if (batch.length > 0) {
      await targetCollection.insertMany(batch);
      total += batch.length;
    }

    console.log(`✔ ${name}: ${total} documentos`);
  }

  await source.close();
  await target.close();
  console.log("\nCopia terminada.");
};

main().catch((error) => {
  console.error("Error copiando la base de datos:", error.message);
  process.exit(1);
});
