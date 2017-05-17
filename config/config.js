/**
 * Created by iSmile on 5/10/2017.
 */

//Config values for Watson Discovery Service running in Bluemix
const watsonDiscovery = {
    addDocUrl: 'https://gateway.watsonplatform.net/discovery/api/v1/environments/%s/collections/%s/documents/?version=2016-12-01',
    updateDocUrl: 'https://gateway.watsonplatform.net/discovery/api/v1/environments/%s/collections/%s/documents/%s?version=2016-12-01',
    auth: 'YjExZGE2NDUtZDUyMS00NWE0LTg3NmItNDViYTdjMDVlYmM1Omo4eFIyRFMzVWo1SA==',
    username: 'b11da645-d521-45a4-876b-45ba7c05ebc5',
    password: 'j8xR2DS3Uj5H',
    version: 'v1',
    version_date: '2016-12-01',
    environment_id: 'ac74cff0-5b41-4f53-8bdb-0a9c6e188093',
    collection_id: 'a42791bc-3dc8-4419-9e60-49461aafa9a5'
};

module.exports = {
    watsonDiscovery: watsonDiscovery
};