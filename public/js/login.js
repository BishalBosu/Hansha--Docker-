async function logIn() {
	const emailInput = document.getElementById("email")
	const passInput = document.getElementById("pass")
	const checkInput = document.getElementById("check")

	let isValid = true

	if (!emailInput.checkValidity()) {
		isValid = false
	}
	if (!passInput.checkValidity()) {
		isValid = false
	}
	if (!checkInput.checkValidity()) {
		isValid = false
	}

	if (isValid) {
        const email = emailInput.value;
        const pass = passInput.value;

        obj = {
            email,
            pass
        }

        

        try {
			const login_result = await axios.post(`${BASE_URL}/login`, obj)
			//console.log(login_result);
			localStorage.setItem('token', login_result.data.token)		
			const decodedToken = parseJwt(login_result.data.token);
			localStorage.setItem('name',decodedToken.name);		
			

			alert(`Hi! ${localStorage.getItem('name')} you have Logged in sucessfully!`)
			localStorage.setItem("groupid", 1)
			window.location.href = "index.html"

			


		} catch (err) {
			if (err.response.status == 404)
				alert("Email not found! check you email address or Sign up Now!");
			else alert("Wrong password entred!")
           
		}



	}
    else{
        alert("Please fill all the fields!")
    }

}




//front end jwt parser
function parseJwt(token) {
	var base64Url = token.split(".")[1]
	var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
	var jsonPayload = decodeURIComponent(
		window
			.atob(base64)
			.split("")
			.map(function (c) {
				return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
			})
			.join("")
	)

	return JSON.parse(jsonPayload)
}