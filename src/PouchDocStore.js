import { flow as f, types as t } from 'mobx-state-tree'
import { values } from 'mobx'
import validate from 'aproba'
import { it } from 'param.macro'

function createPouchDocsStore(modelType) {
  const modelName =
    modelType.name === 'AnonymousModel' ? 'Doc' : modelType.name
  validate('O', arguments)
  return t
    .model(`Pouch${modelName}Store`, {
      byId: t.map(modelType),
    })
    .views(s => ({
      get all() {
        return values(s.byId)
      },
      docToModel(doc) {
        validate('O', arguments)
        return modelType.create(doc)
      },
    }))
    .actions(s => ({
      replaceAll(docs) {
        validate('A', arguments)
        s.byId.replace(pouchDocsToIdLookup(docs))
      },
      put(doc) {
        validate('O', arguments)
        s.byId.put(s.docToModel(doc))
      },
      remove(doc) {
        validate('O', arguments)
        s.byId.delete(doc._id)
      },
      _handleChange(change) {
        validate('OZZ', arguments)
        console.debug(`change`, ...arguments)
        const doc = change.doc

        change.deleted ? s.remove(doc) : s.put(doc)
      },
    }))
    .actions(s => ({
      initPouch: f(function*(db) {
        const { rows } = yield db.allDocs({
          include_docs: true,
        })
        const docs = rows.map(it.doc)
        console.log(`docs`, docs)
        s.replaceAll(docs)
        db.changes({
          include_docs: true,
          live: true,
          since: 'now',
        })
          .on('change', s._handleChange)
          .on('error', console.error)
      }),
    }))
}
