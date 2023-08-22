//creates an group and show it to the side bar

//display the form to create group
function createGroup() {
	//saving the old element
	const old_elem = document.getElementById("side-bar").innerHTML
	localStorage.setItem("old_side", old_elem)

	// Create a break line element
	var br = document.createElement("br")

	// Create a form dynamically
	var form = document.createElement("form")

	// Create an input element for group name
	var grp_name_label = document.createElement("label")
	grp_name_label.setAttribute("for", "grp_name")
	grp_name_label.setAttribute("style", "color: white; width: inherit")
	grp_name_label.setAttribute("class", "m-2")
	grp_name_label.innerHTML = "Name: "

	var grp_name = document.createElement("input")
	grp_name.setAttribute("type", "text")
	grp_name.setAttribute("name", "grp_name")
	grp_name.setAttribute("class", "m-2")
	grp_name.setAttribute("id", "g-name")

	grp_name.setAttribute("placeholder", "My favourite Group")
	grp_name.setAttribute("style", "width: 90%; background-color: green")

	// Create an input element for group description
	var grp_desc_label = document.createElement("label")
	grp_desc_label.setAttribute("for", "grp_name")
	grp_desc_label.setAttribute("style", "color: white; width: inherit")
	grp_desc_label.setAttribute("class", "m-2")
	grp_desc_label.innerHTML = "Desc: "

	var desc = document.createElement("input")
	desc.setAttribute("type", "text")
	desc.setAttribute("name", "desc")
	desc.setAttribute("placeholder", "goood! old friends!")
	desc.setAttribute("class", "m-2")
	desc.setAttribute("style", "width: 90%; background-color: green")
	desc.setAttribute("id", "g-desc")

	// Create a submit button
	var s = document.createElement("input")
	s.setAttribute("type", "button")
	s.setAttribute("onclick", "newGroup()")
	s.setAttribute("class", "btn btn-success m-3")
	s.setAttribute("style", "width: 60%;")
	s.setAttribute("value", "Submit")

	// Append the grp name input to the form
	form.appendChild(br.cloneNode())
	form.append(grp_name_label)
	form.appendChild(br.cloneNode())

	form.append(grp_name)
	form.appendChild(br.cloneNode())

	// Append the description to the form
	form.append(grp_desc_label)
	form.appendChild(br.cloneNode())

	form.append(desc)
	form.appendChild(br.cloneNode())

	// Append the button to the form
	form.append(s)
	form.appendChild(br.cloneNode())

	//form.style.

	document.getElementById("side-bar").innerHTML = ""
	document.getElementById("side-bar").style.width = "40%"
	document.getElementById("side-bar").style.zIndex = "5"

	document.getElementById("side-bar").appendChild(form)
}

async function newGroup() {
	const gName = document.getElementById("g-name").value
	const gDesc = document.getElementById("g-desc").value

	let isvalid = true

	if (gName == "") {
		isvalid = false
	}
	if (gDesc == "") {
		isvalid = false
	}

	if (isvalid) {
		try {
			const token = localStorage.getItem("token")
			const groupCreated = await axios.post(
				`${BASE_URL}/group/creategroup`,
				{ gName, gDesc },
				{
					headers: { Authorization: token },
				}
			)

			//console.log(groupCreated)
			showGroup(
				groupCreated.data.id,
				groupCreated.data.group_name,
				groupCreated.data.join_uuid
			)
		} catch (err) {
			alert("some error in saving group!")
			const old = localStorage.getItem("old_side")
			document.getElementById("side-bar").innerHTML = old
			console.log(err)
		}
	} else {
		alert("fill both name and description.")
	}
}

function showGroup(id, name, join_uuid) {
	const old = localStorage.getItem("old_side")
	document.getElementById("side-bar").innerHTML = old
	document.getElementById("side-bar").removeAttribute("style")
	document.getElementById(
		"groups-area"
	).innerHTML += `<div class="mx-2 px-2 group-head" onclick="showGroupData(${id},'${name}', '${join_uuid}')">${name}</div><br>`
}

async function showExistingGroup() {
	try {
		const token = localStorage.getItem("token")
		const groupsResponse = await axios.get(`${BASE_URL}/group/getall`, {
			headers: { Authorization: token },
		})

		showAllExistingGroups(groupsResponse.data)
	} catch (err) {
		console.log("error in showing groups ", err)
	}
}

function showAllExistingGroups(groups) {
	console.log(groups)
	//clearing the bar:
	document.getElementById("groups-area").innerHTML = ""

	groups.forEach((element) => {
		//console.log(element);
		document.getElementById(
			"groups-area"
		).innerHTML += `<div class="mx-2 px-2 group-head" onclick="showGroupData(${element.id}, '${element.group_name}', '${element.join_uuid}')">${element.group_name}</div><br>`
	})
}

//clicked on group then
//to show group messages
async function showGroupData(groupId, groupName, join_uuid) {
	//req to join socket room with join_uuid
	socket.emit("join-room", groupId)


	localStorage.setItem("groupid", groupId)
	localStorage.removeItem("msgs")

	document.getElementById("group-name").innerHTML = `<h2>${groupName}</h2>`
	if (groupId != 1) {
		document.getElementById(
			"group-name"
		).innerHTML += `<div><button style="color: #2ca913;" id= "copy-uuid-btn" class="btn" onclick="copyJoincode('${join_uuid}')">Copy Goup Join Code.</button></div>`
	}
	document
		.getElementById("send-btn")
		.setAttribute("onclick", `sendMessage(${groupId})`)
	document
		.getElementById("loadall-btn")
		.setAttribute("onclick", `loadAll(${groupId})`)

	//function from index.js
	loadGroupMessages()
}

//copy join code:
function copyJoincode(join_uuid) {
	var dummy = document.createElement("textarea")
	document.body.appendChild(dummy)
	dummy.value = join_uuid
	dummy.select()

	dummy.setSelectionRange(0, 99999)
	navigator.clipboard.writeText(dummy.value)

	document.body.removeChild(dummy)
}

//Ehen join code is entred:
async function joinGoup() {
	try {
		const uuidToJoin = document.getElementById("g-join").value
		if (uuidToJoin != "") {
			const token = localStorage.getItem("token")
			const join_response = await axios.post(`${BASE_URL}/group/join/`, {uuidToJoin}, {
				headers: { Authorization: token },
			})

			//console.log(join_response.data.group.id)
			alert("You have joined the group successfully!")
			document.getElementById(
				"groups-area"
			).innerHTML += `<div class="mx-2 px-2 group-head" onclick="showGroupData(${join_response.data.group.id}, '${join_response.data.group.group_name}', '${join_response.data.group.join_uuid}')">${join_response.data.group.group_name}</div><br>`

		}
	} catch (err) {
		console.log(err)
	}
}


