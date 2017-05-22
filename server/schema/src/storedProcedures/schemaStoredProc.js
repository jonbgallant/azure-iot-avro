module.exports = {
  id: 'schemaQuery',
  serverScript: (schemaId) => {
    const context = getContext();
    const response = context.getResponse();
    const collection = context.getCollection();
    const collectionLink = collection.getSelfLink();

    // Parse input to make query
    const parts = schemaId.split(':');
    let querySpec;

    // Request was malformed
    if (parts.length != 2) {
      response.sendStatus(400);
      return;
    }
    // We got both a name and a version so create the query spec
    querySpec = {
      query: 'SELECT * FROM root r WHERE r.name=@name AND r.version=@version',
      parameters: [{
        name: '@name',
        value: parts[0]
      }, {
        name: '@version',
        value: parts[1]
      }]
    };

    collection.queryDocuments(collectionLink, querySpec, {}, (err, res) => {
      if (err || res.length !== 1) {
        response.sendStatus(500);
        return;
      }
      response.setBody(res);
    })
  }
}
