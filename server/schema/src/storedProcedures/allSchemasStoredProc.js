module.exports = {
  id: 'allSchemasQuery',
  serverScript: () => {
    var context = getContext()
    var response = context.getResponse()
    var collection = context.getCollection()
    var collectionLink = collection.getSelfLink()

    var querySpec = {
      query: 'SELECT * FROM root r'
    }

    collection.queryDocuments(collectionLink, querySpec, {}, (err, res) => {
      if (err) {
        response.sendStatus(500)
      } else {
        var schemas = []

        res.forEach(s => {
          var schema = {
            schemaId: s.name + ':' + s.version,
            schema: s.schema
          }
          schemas.push(schema)
        })

        response.setBody({
          schemas: schemas
        })
      }
    })
  }
}
