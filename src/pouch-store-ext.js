import { addDisposer, flow as f } from 'mobx-state-tree'
import { values } from 'mobx'
import validate from 'aproba'
import { it } from 'param.macro'
import { objFromList } from './ramda-helpers'
import { getNodeName } from './mst-helpers'

function pouchDocsToIdLookup(docs) {
  validate('A', arguments)
  return objFromList(it._id)(docs)
}

export function pouchStoreExt(modelType) {
  validate('O', arguments)
  return s => ({
    views: {
      get all() {
        return values(s.byId)
      },
      docToModel(doc) {
        validate('O', arguments)
        return modelType.create(doc)
      },
    },
    actions: {
      replaceAllDocs(docs) {
        validate('A', arguments)
        s.byId.replace(pouchDocsToIdLookup(docs))
      },
      putDoc(doc) {
        validate('O', arguments)
        s.byId.put(s.docToModel(doc))
      },
      remove(doc) {
        validate('O', arguments)
        s.byId.delete(doc._id)
      },
      _handlePouchChange(change) {
        validate('OZZ', arguments)
        console.debug(`change`, ...arguments)
        const doc = change.doc

        change.deleted ? s.remove(doc) : s.putDoc(doc)
      },
      initPouch: f(function*(db) {
        const { rows } = yield db.allDocs({
          include_docs: true,
        })
        const docs = rows.map(it.doc)
        console.log(`[${getNodeName(s)}] initial docs`, docs)
        s.replaceAllDocs(docs)
        const changes = db
          .changes({
            include_docs: true,
            live: true,
            since: 'now',
          })
          .on('change', s._handlePouchChange)
          .on('error', console.error)
        addDisposer(s, () => changes.cancel())
      }),
    },
  })
}