module.exports = {
  id: 'schemaQuery',
  serverScript: (schemaId) => {
    var context = getContext()
    var response = context.getResponse()
    var collection = context.getCollection()
    var collectionLink = collection.getSelfLink()

    // Parse input to make query
    var parts = schemaId.split(':')
    var querySpec

    // We got both a name and a version
    if (parts.length > 1) {
      querySpec = {
        query: 'SELECT * FROM root r WHERE r.name=@name AND r.version=@version',
        parameters: [{
          name: '@name',
          value: parts[0]
        }, {
          name: '@version',
          value: parts[1]
        }]
      }
    } else { // Request was malformed
      response.sendStatus(400)
    }

    collection.queryDocuments(collectionLink, querySpec, {}, (err, res) => {
      if (err || res.length !== 1) {
        response.sendStatus(500)
      } else {
        response.setBody(res)
      }
    })
  }
}
