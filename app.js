var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
var email = "thinh.nguyen04@hcmut.edu.vn"

if (regex.test(email)) {
    console.log("true")
}
else {
    console.log("false")
}