module.exports = {
  id: 'allSchemasQuery',
  serverScript: () => {
    const context = getContext();
    let response = context.getResponse();
    const collection = context.getCollection();
    const collectionLink = collection.getSelfLink();

    const querySpec = {
      query: 'SELECT * FROM root r'
    };

    collection.queryDocuments(collectionLink, querySpec, {}, (err, res) => {
      if (err) {
        response.sendStatus(500);
        return;
      }

      let schemas = [];
      res.forEach(s => {
        const schema = {
          schemaId: s.name + ':' + s.version,
          schema: s.schema
        }
        schemas.push(schema)
      });

      response.setBody({
        schemas: schemas
      });
    })
  }
}
