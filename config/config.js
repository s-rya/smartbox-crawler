/**
 * Created by iSmile on 5/10/2017.
 */
'use strict';

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
    //collection_id: 'a42791bc-3dc8-4419-9e60-49461aafa9a5'
    collection_id: 'aace4214-d9f3-440f-9ef6-81f7228ea848'
};

//Config values for Watson Conversation Service running in Bluemix
const watsonCoversation = {
    url: 'https://gateway.watsonplatform.net/conversation/api',
    version_date: '2017-05-26',
    version: 'v1',
    workspaceId: '8dd2e891-2b13-41b7-9737-009a9d9e382b',
    workspaceUserName: 'c715a3d3-4510-4fca-9a1e-73b29e018291',
    workspacePassword: 'gseiGfBJ5CNI',
    authToken: 'YzcxNWEzZDMtNDUxMC00ZmNhLTlhMWUtNzNiMjllMDE4MjkxOmdzZWlHZkJKNUNOSQ=='
};

const AID = ["terminology and acronyms","overview","business overview","application overview","application platform","development environment","testing environment:","pre- production environment:","production environment:","hw/sw environment","software","inventory statistics","urls","configuration management","<app name> architecture","application structure","functional flow","data flows","application modules","shared modules","interfaces","inbound interfaces","outbound interfaces","application monitoring tools","application dependencies","databases and files","internal data flow","databases","internal files","external system interfaces","user interfaces","db object description","application monitoring","batch / jobs / schedulers","application monitoring tools","application history","typical problems","release history","maintenance history","reference documents","appendix a","appendix b","glossary","about","	high level overview","functional overview","functional high level","about functional","system overview","it application overview","app overview","system platform","technilogy platform","app platform","dev env","dev environment","build environment","test env","qa env","quality environment","pre-prod environment","preprod environment","preprod","preprod env","prod env","prod","prod environment","harware/software env","sw","soft-ware","app modules","application functions","application function","system modules","system functions","shared functions","inflow interfaces","incoming data","inbound","dependencies","system dependencies"];

module.exports = {
    watsonDiscovery: watsonDiscovery,
    watsonCoversation: watsonCoversation,
    AID: AID
};