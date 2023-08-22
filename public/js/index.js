const socket = io('http://localhost:3000')


function logOut() {
	localStorage.clear();
	window.location.href = "/html/login.html"
}

// async function sendMessage(groupId) {
// 	const message = document.getElementById("msg").value
// 	if (message != "") {
// 		const token = localStorage.getItem("token")
// 		try {
// 			await axios.post(
// 				`${BASE_URL}/message/send`,
// 				{ message: message, name: localStorage.getItem("name"), groupid: groupId},
// 				{
// 					headers: { Authorization: token },
// 				}
// 			)

// 			show_message(localStorage.getItem('name'), message)
// 			document.getElementById("msg").value = ""
// 		} catch (err) {
// 			console.log(err)
// 		}
// 	}
// }

//with sendMessage with socket.io
async function sendMessage(groupId) {
	const message = document.getElementById("msg").value;
	if (message != "") {
	  const token = localStorage.getItem("token");
	  try {
		socket.emit("sendMessage", {
		  message: message,
		  name: localStorage.getItem("name"),
		  groupid: groupId,
		  token: token,		  
		});
  
		show_message(localStorage.getItem("name"), message);
		document.getElementById("msg").value = "";
	  } catch (err) {
		console.log(err);
	  }
	}
  }
  

async function loadAll(groupId){
	//FOR GETTING ALL MESSAGES
			try {
				const token = localStorage.getItem("token")
				const all_message_response = await axios.get(
					`${BASE_URL}/message/getall/${groupId}`,
					{
						headers: { Authorization: token },
					}
				)
				

				localStorage.setItem("msgs", JSON.stringify(all_message_response.data))

				showLocalMsgs()
			} catch (err) {
				console.log("error in dom loded", err)
			}
}

//needed to load messgaes
async function loadGroupMessages(){		
	console.log("loading..");
		try {
			const groupId = localStorage.getItem("groupid")
			const token = localStorage.getItem("token")
			const msgs_obj = localStorage.getItem("msgs")

			if (!msgs_obj) localStorage.setItem("lastId", 0)

			else if (msgs_obj) {
				const msgs_arr = JSON.parse(msgs_obj)
				if (msgs_arr.length > 0)
					localStorage.setItem("lastId", msgs_arr[msgs_arr.length - 1].id)
			}

			const all_message_response = await axios.get(
				`${BASE_URL}/group/getnew/groupmessage/${groupId}?lastId=${localStorage.getItem("lastId")}`,
				{
					headers: { Authorization: token },
				}
			)
			const msgsLen = all_message_response.data.length
			//froms erver we get max 10 messages
			if (msgsLen == 10 || !msgs_obj) {
				//console.log(all_message_response.data, JSON.stringify(all_message_response.data));
				localStorage.setItem(
					"msgs",
					JSON.stringify(all_message_response.data)
				)
			}
			
			//size can be 1 to 9				
			else if (msgsLen > 0) {
				//console.log(all_message_response.data, JSON.stringify(all_message_response.data));
				//adding new data with old data
				let newMsgsArr = [...JSON.parse(msgs_obj), ...all_message_response.data];

				//taking only last 10 msgs
				newMsgsArr = newMsgsArr.slice(-10)
				localStorage.setItem(
					"msgs",
					JSON.stringify(newMsgsArr)
				)
			}

			showLocalMsgs()
		} catch (err) {
			console.log("error in dom loded", err)
		}	
	
}

//when refreshed
window.addEventListener("DOMContentLoaded", async () => {
	if (!localStorage.getItem("token")) {
		window.location.href = "/html/login.html"
	} else {
		//function from group.js
		showExistingGroup();
		loadGroupMessages();
		socket.on("receive-message", (data)=>{
			console.log(data.success)
			if(data.success)
				loadGroupMessages()
			else{
				alert(data.message)
			}


		})
	}
})

//UTIL functions
function showAllMessage(messages) {
	//console.log("msgs", messages)
	document.getElementById("chats").innerHTML = ``
	messages.forEach((element) => {
		show_message(element.name, element.messages)
	})
}

function show_message(name, message) {
	document.getElementById(
		"chats"
	).innerHTML += `<tr><td>${name}</td><td>${message}</td></tr>`
}

//util functions
function showLocalMsgs() {
	const msgs_obj = localStorage.getItem("msgs")
	const msgs_arr = JSON.parse(msgs_obj)
	showAllMessage(msgs_arr)
}


