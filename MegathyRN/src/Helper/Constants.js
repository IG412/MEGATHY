var { EventEmitter } = require("fbemitter");

module.exports = {
    emitter: new EventEmitter(),
    LOGIN_STATUS: "false",
    LOGOUT_EVENT: "logout",

    /// Async Storage Keys
    keyCurrentUser: "currentUser",
    keyCurrentSettings: "currentSettings",
    keyCurrentStore: "currentStore",

    /// Common API request parameters
    deviceTypeiPhone: "IPHONE",
    deviceTypeAndroid: "ANDROID",
    notifyId: "0123456789",
    timeZone: "Asia/Riyadh",

    /// Rest API details
    // Base URL
    baseURL: "http://192.168.0.3/megathylaravel/public/api/v1/", // Jay Kaneriya
    // baseURL: "http://192.168.0.2/MegathyLaravel/public/api/v1/", //Chintan Adatiya

    /// End Points
    // Login/Signup
    login: "userLogin",
    register: "registerUser",
    forgotPassword: "requestForgotPassword",
    verifyFBId: "verifyfacebookId",
    getCity: "getCity",
    getArea: "getArea",
    getStore: "getStore",
    setStore: "setStore",

    /// Menu Screens
    getCategory: "getCategory?page=1",
    getSubCategory: "getSubCategory?page=1&categoryId=",
    getBanners: "banners",

    /// Other Misc Constants
    alertTitle: "Megathy",

    /// Colors
    themeColor: "#CF2526",
    ProdCategoryBGColor: "#EFEDE9",

    /// Font Family
    themeFont: "Ebrima",
};

/*
Network Utility API Call Template

    this.state = {
        visible: false,
    };

    // Show Loading View
    this.setState({ visible: true });

    networkUtility.postRequest(constant.forgotPassword, forgotPasswordParameters).then(
        result => {
            // Hide Loading View
            this.setState({ visible: false });

            // HTTP Status Code => {result.status}
        },
        error => {
            // Hide Loading View
            this.setState({ visible: false });

            console.log("\nStatus Code: " + error.status);
            console.log("\nError Message: " + error.message);
            if (error.status != 500) {
                if (global.currentAppLanguage != "en" && error.data["messageAr"] != undefined) {
                    alert(error.data["messageAr"]);
                } else {
                    setTimeout(() => {
                        alert(error.data["message"]);
                    }, 200);
                }
            } else {
                console.log("Internal Server Error: " + error.data);
                alert("Something went wrong, plese try again");
            }
        }
    );

    // Loading View
    import Spinner from "react-native-loading-spinner-overlay";

    // Show Spinner in render()

    <Spinner
        visible={this.state.visible}
        cancelable={true}
        textStyle={{ color: "#FFF" }}
    />

*/
