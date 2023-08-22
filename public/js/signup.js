async function registerUser() {
	const nameInput = document.getElementById("name")
	const emailInput = document.getElementById("email")
	const phoneInput = document.getElementById("phone")
	const passInput = document.getElementById("pass")
	const checkInput = document.getElementById("check")

	let isValid = true
	if (!nameInput.checkValidity()) {
		isValid = false
	}
	if (!emailInput.checkValidity()) {
		isValid = false
	}
	if (!phoneInput.checkValidity()) {
		isValid = false
	}
	if (!passInput.checkValidity()) {
		isValid = false
	}
	if (!checkInput.checkValidity()) {
		isValid = false
	}

	if (isValid) {
		const name = nameInput.value
		const email = emailInput.value
		const phone = phoneInput.value
		const pass = passInput.value
	

		obj = {
			name,
			email,
			phone,
			pass,
		}
		try {
			const user = await axios.post(`${BASE_URL}/signup`, obj)
			alert(`Hi ${user.data.name}! You are successfully registered try loging in now!`)
			window.location.href = "/html/login.html";
		} catch (err) {
			if (err.response.status == 409) {
				alert("Email alredy registered! try Login insted!");
                window.location.href = "/html/login.html";
			}
		}
	}
    else{
        alert("Fill all the items correctly!")
    }
}
