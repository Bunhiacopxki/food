const { db, ref, set, child, onValue } = require('../models/database');
const { auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, fetchSignInMethodsForEmail, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential, updatePassword } = require('../models/auth');

class AuthService {
    createUser = async (data) => {
        const { email, password, name } = data;
        return new Promise((resolve, reject) => {
            fetchSignInMethodsForEmail(auth, email)//Check email đã đk hay ch?
            .then((signInMethods) => {
                if(signInMethods.length > 0) { //Email đã đăng ký
                    reject({status: false});
                } else {
                    createUserWithEmailAndPassword(auth, email, password)
                    .then((userCredential) => {
                        const uid = userCredential.user.uid;
                        const userRef = child(ref(db, "Users"), `${uid}`);
                        set(userRef, {
                            Infor: {
                                Name: name,
                                PhoneNum: "",
                                Email: email,
                                Address: ""
                            },
                            OrderList: "",
                            Role: "user"
                        });
                        // console.log(`Đăng ký thành công. UID: ${uid}`);
                        resolve({status: true});
                    })
                    .catch((error) => {
                        reject(error);
                    })
                }
            })
            .catch((error) => {
                reject(error);
            })
        });
    }

    logout = () => {
        return new Promise((resolve, reject) => {
            if(auth.signOut()) {
                resolve({status: true});
            } else {(error) => reject(error)}
        });
    }

    login = async (data) => {
        const { email, password } = data;
        return new Promise((resolve, reject) => {
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const dbRef = ref(db, `Users/${userCredential.user.uid}`);
                onValue(dbRef, (snapshot) => {
                    if (snapshot.exists()) {
                        const products = snapshot.val();
                        resolve({
                            status: true,
                            name: products.Infor.Name,
                            email: products.Infor.Email
                        });
                    } else {
                        resolve({status: false});
                    }
                }, (error) => reject(error));
            })
            .catch((error) => {
                reject(error);
            })
        })
    }

    forgotPassword = async (email) => {
        return new Promise ((resolve, reject) => {
            var rac = ""
            for (let key in email) {
                rac += email[key]
            }
            sendPasswordResetEmail(auth, email)
            .then(() => {
                // alert("An email has been sent to you with instructions to reset your password.");
                resolve({status: true});
            })
            .catch((error) => {
                // alert("An error occurred while sending the password reset email");
                reject(error);
            });
        })
    }

    changePassword = async (data) => {
        const { currentPassword, newPassword } = data;
        return new Promise((resolve, reject) => {
            var user = auth.currentUser;
            if (user) {
                var credential = EmailAuthProvider.credential(user.email, currentPassword);
                reauthenticateWithCredential(user, credential)
                .then(() => {
                    updatePassword(user, newPassword)
                    .then(() => {
                        console.log("Password updated successfully.");
                        resolve({
                            Email: user.email,
                            Password: newPassword
                        })
                    })
                    .catch((error) => {
                        reject(error);
                    });
                })
                .catch((error) => {
                    reject(error);
                });
            }
            else {
                reject({status: false});
            }
        })
    }
}

module.exports = new AuthService