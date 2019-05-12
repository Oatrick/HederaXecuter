import { Query } from './pbnode/Query_pb'
import { Response } from './pbnode/Response_pb'
import { ResponseHeader } from './pbnode/ResponseHeader_pb'
import {
    FileGetContentsResponse,
    FileContents
} from './pbnode/FileGetContents_pb'
import { FileID } from './pbnode/BasicTypes_pb'
import i from './internal'
import logger from '../logger'

async function fileGetContentsProxy(self, data) {
    let q = Query.deserializeBinary(data)
    let result = await fileGetContentsPromise(self, q)
    let responseData = {}
    if (result.err === 14) {
        return {
            error: 'UNAVAILABLE. Hedera network unreachable.'
        }
    }
    let response = responseToResponseType(result.res)
    responseData = {
        nodePrecheckcode: response
            .getFilegetcontents()
            .getHeader()
            .getNodetransactionprecheckcode(),
        fileContents: response
            .getFilegetcontents()
            .getFilecontents()
            .getContents_asB64(),
        fileID: i.fileStringFromFileID(
            response
                .getFilegetcontents()
                .getFilecontents()
                .getFileid()
        ),
        error: result.err
    }
    return responseData
}

// re-constitute
function responseToResponseType(res) {
    let r = Response.toObject(true, res)
    logger.info(r)

    let responseHeader = new ResponseHeader()
    responseHeader.setNodetransactionprecheckcode(
        r.filegetcontents.header.nodetransactionprecheckcode
    )
    responseHeader.setResponsetype(r.filegetcontents.header.responsetype)
    responseHeader.setCost(r.filegetcontents.header.cost)
    responseHeader.setStateproof(r.filegetcontents.header.stateproof)

    let fileid = r.filegetcontents.filecontents.fileid
    let filecontents = r.filegetcontents.filecontents.contents

    let fileID = new FileID()
    if (fileid !== undefined) {
        fileID.setShardnum(fileid.shardnum)
        fileID.setRealmnum(fileid.realmnum)
        fileID.setFilenum(fileid.filenum)
    }
    let fileContents = new FileContents()
    fileContents.setFileid(fileID)
    fileContents.setContents(filecontents)

    let f = new FileGetContentsResponse()
    f.setHeader(responseHeader)
    f.setFilecontents(fileContents)

    let response = new Response()
    response.setFilegetcontents(f)
    return response
}

async function fileGetContentsPromise(self, q) {
    return new Promise((resolve, reject) => {
        self.clientFile.getFileContent(q, (err, res) => {
            if (err) {
                if (err.code === 14) {
                    // network unreachable (UNAVAILABLE, connect failed)
                    let result = { err: err.code, res: null }
                    resolve(result)
                }
                reject(err)
            } else {
                let result = { err, res }
                resolve(result)
            }
        })
    })
}

export { fileGetContentsProxy }
