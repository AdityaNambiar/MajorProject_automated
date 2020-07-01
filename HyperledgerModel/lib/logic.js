/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';


 
/**
 * Write your transction processor functions here
 */

/**
 * @param {org.devopschain.asset.createProject} createData
 * @transaction
 */
async function createProject(createData) {
	let currentdate = new Date(); 
    let datetime = currentdate.getDate() + "-"
                    + (currentdate.getMonth()+1)  + "-" 
                    + currentdate.getFullYear();
		let NS = 'org.devopschain.asset'
		let pType = getCurrentParticipant().getType();
		let pIdentifier = getCurrentParticipant().getIdentifier();
		// if (pType!=='ProjectManager'){
		// 	throw new Error("You are not allowed to perform this operation...");
		// }
		let factory = getFactory();
		let project = factory.newResource(NS,'Project',createData.projectid);
	
		project.description = createData.description;
		project.collaborators = [];
		project.projecthash = "";
		project.private = createData.private;
		project.datetime = datetime;
		project.chats = [];
		let relationship = factory.newRelationship('org.devopschain.participant',pType,pIdentifier);
		project.creator = relationship;
		let projectRegistry = await getAssetRegistry(NS+'.Project');
		await projectRegistry.add(project);

		let event = factory.newEvent(NS,'projectCreated');
		event.project = JSON.stringify(project);
		emit(event);
}
/**
 * @param {org.devopschain.asset.readProject} projectData
 * @transaction
 */
	async function readProject(projectData){
		let NS = 'org.devopschain.asset'
		let factory = getFactory();
		let projectid = projectData.projectid;
		let pregistry = await getAssetRegistry(NS+'.Project')
		let project = await pregistry.get(projectid);
		let collaborators = project.collaborators;
		let privates = project.private;
		let creator = project.creator;
		let pType = getCurrentParticipant().getType();
      	let pIdentifier = getCurrentParticipant().getIdentifier();
		let memberIdentifier = [];
		memberIdentifier.push(creator.getType()+creator.getIdentifier()); //Pushing Project Manager
		collaborators.forEach(element => {
			memberIdentifier.push(element.pType+element.pIdentifier); // Pushing Collaborators
		});
		let iscollaborator = memberIdentifier.includes(pType+pIdentifier);
		
					if(privates==true){
						if(iscollaborator==true){
							let event = factory.newEvent('org.devopschain.asset','projectRead');
							event.project = JSON.stringify(project);
							emit(event);
						}else{
							throw new Error("You are not allowed to Read the Project...");
						}

				}else if(privates==false){
					let event = factory.newEvent('org.devopschain.asset','projectRead');
					event.project = JSON.stringify(project);
					emit(event);
				
				}
				
	 
		       
	}

/**
 * @param {org.devopschain.asset.updateProject} updateData
 * @transaction
 */
async function updateProject(updateData){
	let factory = getFactory();
	let NS = 'org.devopschain.asset'
		let projectid = updateData.projectid;
		let projectRegistry = await getAssetRegistry(NS+'.Project');
		try{
			let project = await projectRegistry.get(projectid);
			let creator = project.creator.getFullyQualifiedIdentifier();
			if (getCurrentParticipant().getFullyQualifiedIdentifier()!==creator){
				throw new Error("You are not allowed to perform this operation...");
			}
			project.description = updateData.description;
			project.collaborators = updateData.collaborators;
			project.private = updateData.private;
			project.projecthash = updateData.projecthash;
			await projectRegistry.update(project);
			let event = factory.newEvent(NS,'projectUpdated');
			event.project = JSON.stringify(project);
			await emit(event);
		}catch(error){
			throw new Error(error);
		}
			
		
}
/**
 * @param {org.devopschain.asset.deleteProject} deleteProject
 * @transaction 
 */

 async function deleteProject(deleteProject){
	 let NS = 'org.devopschain.asset';
	 let factory = getFactory();
	 let projectid = deleteProject.projectid;
	 let projectRegistry = await getAssetRegistry(NS+'.Project');
	 let project = await projectRegistry.get(projectid);
	let creator = project.creator.getFullyQualifiedIdentifier();
	if (getCurrentParticipant().getFullyQualifiedIdentifier()!==creator){
				throw new Error("You are not allowed to perform this operation...");
			}
	await projectRegistry.remove(project);
	let event = factory.newEvent(NS,'projectDeleted');
	event.project = JSON.stringify(project);
	await emit(event);
	 
 }

 /** 
  * @param {org.devopschain.asset.getAllProjects} getProjects
  * @transaction
  */
 async function getAllProjects(getProjects){ 
	let factory = getFactory();
	let results = await query('getAllProjects');
	let event = factory.newEvent('org.devopschain.asset','projects');
	event.projects = JSON.stringify(results);
	emit(event);
 }

/**
 * @param {org.devopschain.asset.createParticipant} pData
 * @transaction 
 */
async function createParticipant(pData){
	let factory = getFactory();
	let pType = pData.pType; 
	let pIdentifier = pData.pIdentifier;
	let participantRegistry = await getParticipantRegistry('org.devopschain.participant.'+pType);
	let resource = factory.newResource('org.devopschain.participant',pType,pIdentifier);
	resource.pType = pType;
	resource.pIdentifier = pIdentifier;
	resource.fname = pData.fname;
	resource.lname = pData.lname;
	resource.gender = pData.gender;
	resource.designation = pData.designation;
	resource.employeeid = pData.employeeid;
	resource.emailid  = pData.emailid;
	resource.contact = pData.contact;
	participantRegistry.add(resource).then(()=>{
        let event  = factory.newEvent('org.labsystem.asset','participantCreated');
        event.pdetails = JSON.stringify(resource);
        emit(event);
    })
}

/**
 * @param {org.devopschain.asset.getParticipants} getData
 * @transaction 
 */
async function getParticipants(getData){
	let pType = getCurrentParticipant().getType();
		let pIdentifier = getCurrentParticipant().getIdentifier();
		// if (pType!=='ProjectManager'){
		// 	throw new Error("You are not allowed to perform this operation...");
		// }
		let factory = getFactory();
		let results = await query('getAllMembers');
		let event = factory.newEvent('org.devopschain.asset','participants');
		event.participants = JSON.stringify(results);
		emit(event);
}


/**
 * @param {org.devopschain.asset.getProjectsOfManager} mData
 * @transaction 
 */

 async function getProjectsOfManager(mData){
	let pType = getCurrentParticipant().getType();
	let pIdentifier = getCurrentParticipant().getIdentifier();
	if (pType!=='ProjectManager'){
		throw new Error("You are not allowed to perform this operation...");
	}
	let NS = 'org.devopschain.asset'
   	let resource = `resource:org.devopschain.participant.${pType}#${pIdentifier}`;
   	console.log(resource);
   	let statement = 'SELECT org.devopschain.asset.Project WHERE (creator == _$inputValue)';
	 let factory = getFactory();

	 // Build a query.
	var q = await buildQuery(statement);
	// Execute the query.
	let results = await query(q, { inputValue: resource });
	let event = factory.newEvent(NS,'projectsOfManager');
	event.projects = JSON.stringify(results);
	emit(event);
 } 

 /**
  * @param {org.devopschain.asset.getProjectsOfMember} mproject
  * @transaction 
  */

  async function getProjectsOfMember(mproject){
		let pIdentifier = getCurrentParticipant().getIdentifier();
		let factory = getFactory();
		let results = await query('getAllProjects');
		let projects = [];
		results.map((pobj)=>{
			let creator = pobj.creator.getFullyQualifiedIdentifier();
			if(creator==getCurrentParticipant().getFullyQualifiedIdentifier()){
				projects.push(pobj);
			}else{
				let collaborators = pobj.collaborators;
			for(let i=0;i<collaborators.length;i++){
				if(collaborators[i].pIdentifier==pIdentifier){
					projects.push(pobj);
					break;
				}
			}

			}
			
		});
		let event = factory.newEvent('org.devopschain.asset','projectsOfMember');
		event.projects = JSON.stringify(projects);
		emit(event);
  }

/**
 * @param {org.devopschain.asset.checkAccess} accessData
 * @transaction
 */
async function checkAccess(accessData){
	let factory = getFactory();
	let pNS = 'org.devopschain.asset.Project';
	let projectid = accessData.projectid;
	let pType = getCurrentParticipant().getType();
	let pIdentifier = getCurrentParticipant().getIdentifier();
	let projectRegistry = await getAssetRegistry(pNS);
	let project = await projectRegistry.get(projectid);
	let privates = project.private;
	let collaborators = project.collaborators;
	let creator = project.creator;
	let memberIdentifier = [];
	memberIdentifier.push(creator.getType()+creator.getIdentifier()); //Pushing Project Manager
	collaborators.forEach(element => {
		memberIdentifier.push(element.pType+element.pIdentifier); // Pushing Collaborators
	});
	let iscollaborator = memberIdentifier.includes(pType+pIdentifier);
	let event = factory.newEvent('org.devopschain.asset','AccessStatus');

	let participantRegistry = await getParticipantRegistry('org.devopschain.participant.'+pType);
	let user = 	await participantRegistry.get(pIdentifier);

	let hash = project.projecthash;
	let manager = project.creator.getIdentifier();
	let name = project.projectid;
	let authorName = pIdentifier;
	let authorEmail = user.emailid;
	let description = project.description;

	let projectDetail = {
		"hash":hash,
		"manager":manager,
		"name":name,
		"authorName":authorName,
		"authorEmail":authorEmail,
		"description":description
	};

	if(iscollaborator){
		event.status = JSON.stringify({"collaborator":true,"private":privates,"project":projectDetail});
		emit(event)
	}else{
		event.status = JSON.stringify({"collaborator":false,"private":privates,"project":projectDetail})
		emit(event)
	}
}

/**
 * @param{org.devopschain.asset.updateHash} hashData
 * @transaction
 */
async function updateHash(hashData){
	let NS = 'org.devopschain.asset.Project';
	let projectRegistry = await getAssetRegistry(NS);
	let project = await projectRegistry.get(hashData.projectid);
	let creator = project.creator;
	let collaborators = project.collaborators;
	let pType = getCurrentParticipant().getType();
    let pIdentifier = getCurrentParticipant().getIdentifier();
		let memberIdentifier = [];
		memberIdentifier.push(creator.getType()+creator.getIdentifier()); //Pushing Project Manager
		collaborators.forEach(element => {
			memberIdentifier.push(element.pType+element.pIdentifier); // Pushing Collaborators
		});
		let iscollaborator = memberIdentifier.includes(pType+pIdentifier);
		
					
						if(iscollaborator==true){
							project.projecthash = hashData.projecthash;
							await projectRegistry.update(project);
						}else{
							throw new Error("You are not allowed to Update the Hash of Project...");
						}
	
}

/**
 * @param {org.devopschain.asset.createClient} pData
 * @transaction 
 */
async function createClient(pData){
	let factory = getFactory();
	let pType = pData.pType; 
	if(getCurrentParticipant().getType()!=="ProjectManager"){
		throw new Error("You are not allowed to make clients")
	}
	let pIdentifier = pData.pIdentifier;
	let participantRegistry = await getParticipantRegistry('org.devopschain.participant.'+pType);
	let resource = factory.newResource('org.devopschain.participant',pType,pIdentifier);
	resource.pType = pType;
	resource.pIdentifier = pIdentifier;
	resource.fname = pData.fname;
	resource.lname = pData.lname;
	resource.gender = pData.gender;
	resource.emailid  = pData.emailid;
	resource.contact = pData.contact;
	participantRegistry.add(resource).then(async ()=>{
	   let clientResource = factory.newResource("org.devopschain.asset","ClientAsset",pIdentifier);
	   clientResource.chats = [];
	   clientResource.clientDocumentHash = [];
	   let relationship = factory.newRelationship('org.devopschain.participant',getCurrentParticipant().getType(),getCurrentParticipant().getIdentifier());
		clientResource.creator = relationship;
		let clientAssetRegistry = await getAssetRegistry("org.devopschain.asset.ClientAsset");
		await clientAssetRegistry.add(clientResource);

		let event  = factory.newEvent('org.devopschain.asset','participantCreated');
		event.pdetails = JSON.stringify(resource);
		emit(event);
	});
	
}

/**
 * @param {org.devopschain.asset.createClientChat} chatData
 * @transaction
 */
async function createClientChat(chatData){

	if(getCurrentParticipant().getType()=="Member"){
		throw new Error("You are not allowed to make client chat")
	}
	let factory = getFactory();
	let clientAssetRegistry = await getAssetRegistry("org.devopschain.asset.ClientAsset"); 
	let clientAsset = await clientAssetRegistry.get(chatData.chatid);
	let pType = getCurrentParticipant().getType();
	let pIdentifier = getCurrentParticipant().getIdentifier();
	if(pType=="ProjectManager"){
		if(pIdentifier!=clientAsset.creator.getIdentifier()){
			throw new Error("You are not allowed to perform the operation")
		}
	}
	if(pType=="Client"){
		if(pIdentifier!=chatData.chatid){
			throw new Error("You are not allowed to perform the operation")
		}
	}
	clientAsset.chats.push(chatData.chat);
	await clientAssetRegistry.update(clientAsset);
	let event = factory.newEvent("org.devopschain.asset","chatCreated");
	event.chat = JSON.stringify(getSerializer().toJSON(chatData.chat)) ;
	emit(event)

}	
/**
 * @param {org.devopschain.asset.addDocumentHash} dochash
 * @transaction
 */
async function addDocumentHash(dochash){
	if(getCurrentParticipant().getType()=="Member"){
		throw new Error("You are not allowed to create Document")
	}
	let clientAssetRegistry = await getAssetRegistry("org.devopschain.asset.ClientAsset"); 
	let clientAsset = await clientAssetRegistry.get(dochash.cpid);
	let pType = getCurrentParticipant().getType();
	let pIdentifier = getCurrentParticipant().getIdentifier();
	if(pType=="ProjectManager"){
		if(pIdentifier!=clientAsset.creator.getIdentifier()){
			throw new Error("You are not allowed to perform the operation")
		}
	}
	if(pType=="Client"){
		if(pIdentifier!=dochash.cpid){
			throw new Error("You are not allowed to perform the operation")
		}
	}

	clientAsset.clientDocumentHash.push(dochash.documenthash);
	await clientAssetRegistry.update(clientAsset);
}
/**
 * @param {org.devopschain.asset.createCollaboratorChat} chatData
 * @transaction
 */
async function createCollaboratorChat(chatData){
	let factory = getFactory();
	if(getCurrentParticipant().getType()=="Client"){
		throw new Error("You are not allowed to make Collaborator chat")
	}
	let projectRegistry = await getAssetRegistry("org.devopschain.asset.Project");
	let project  = await projectRegistry.get(chatData.chatid);

	let collaborators = project.collaborators;
	let creator = project.creator;
	let memberIdentifier = [];
	memberIdentifier.push(creator.getType()+creator.getIdentifier()); //Pushing Project Manager
	collaborators.forEach(element => {
		memberIdentifier.push(element.pType+element.pIdentifier); // Pushing Collaborators
	});
	let iscollaborator = memberIdentifier.includes(getCurrentParticipant().getType()+getCurrentParticipant().getIdentifier());
	if(!iscollaborator){
		throw new Error("You cannot chat in this project")
	}

	project.chats.push(chatData.chat);
	await projectRegistry.update(project);
	let event = factory.newEvent("org.devopschain.asset","chatCreated");
	event.chat = JSON.stringify(getSerializer().toJSON(chatData.chat));
	emit(event)
}
/**
 * @param {org.devopschain.asset.getClientsOfManager} mData
 * @transaction
 */
async function getClientsOfManager(mData){
	let factory = getFactory();
	let pType = getCurrentParticipant().getType();
	let pIdentifier = getCurrentParticipant().getIdentifier();
	let statement = 'SELECT org.devopschain.asset.ClientAsset WHERE (creator == _$inputValue)';
	let resource =  `resource:org.devopschain.participant.${pType}#${pIdentifier}`;
		 // Build a query.
	var q = await buildQuery(statement);
	// Execute the query.
	let results = await query(q, { inputValue: resource });
	let event = factory.newEvent("org.devopschain.asset",'clients');
	event.clients = JSON.stringify(results);
	emit(event);

}
/**
 * @param {org.devopschain.asset.getClientAsset} clientData
 * @transaction 
 */
async function getClientAsset(clientData){
	let factory = getFactory();
	let clientAssetRegistry = await getAssetRegistry("org.devopschain.asset.ClientAsset");
	let clientAsset = await clientAssetRegistry.get(clientData.clientid);
	let event = factory.newEvent("org.devopschain.asset",'clientAssetRead');
	event.clientasset = JSON.stringify(clientAsset);
	emit(event)
}