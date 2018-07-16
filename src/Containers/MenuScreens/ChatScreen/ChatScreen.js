/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import { Platform, StyleSheet, AsyncStorage, Dimensions } from "react-native";
import {
    Text,
    View,
    TouchableOpacity,
    ScrollView,
    FlatList,
    TextInput,
    Image,
    Modal,
    TouchableWithoutFeedback,
} from "react-native";

import { connect } from "react-redux"; // Redux
import * as constant from "../../../Helper/Constants"; // Constants
import * as CommonUtilities from "../../../Helper/CommonUtilities"; // Common Utilities
import * as networkUtility from "../../../Helper/NetworkUtility"; // Network Utility
import Spinner from "react-native-loading-spinner-overlay"; // Loading View
import baseLocal from "../../../Resources/Localization/baseLocalization"; // Localization
import ImageLoad from "react-native-image-placeholder";

// Styles
import ChatScreenStyle from "./ChatScreenStyle";

class ChatScreen extends Component {
    constructor(props) {
        super(props);

        baseLocal.locale = global.currentAppLanguage;
        this.state = {
            arrChat: [],
            txtMsg: "",
            isShowImage: false,
        };

        senderId = global.currentUser.id;
        showImage = "";
    }

    static navigationOptions = CommonUtilities.navigationView(baseLocal.t("Messages"), false);

    componentDidMount() {
        this.props.getChat();
    }

    componentWillReceiveProps(newProps) {
        if (newProps.isGetChatSuccess === true) {
            this.forceUpdate();
            // this.refs.chatList.scrollToIndex(newProps.arrChat.length - 1, true);
        }
    }

    // On Press Methods
    _onPressSendMsg = (isSender = true) => {
        constant.debugLog("on Send press .....");
        var sendMessageParameters = {
            message: this.state.txtMsg,
            vendorId: constant.DeviceInfo.getUniqueID(),
        };

        this.props.sendMessage(sendMessageParameters);

        // let arrChatTemp = this.state.arrChat;
        // let objChat = {};
        // objChat["msg"] = this.state.txtMsg;
        // objChat["senderId"] = isSender ? senderId : Math.random();
        // objChat["timeStamp"] = new Date().getTime();
        // arrChatTemp.push(objChat);
        // this.setState({ arrChat: arrChatTemp });
    };

    // Render Methods

    _renderChatItem = ({ item }) => {
        let isSender = item.type === constant.kMessageTypeRequest;
        return (
            <View
                style={{
                    width: "70%",
                    // backgroundColor: "green",
                    alignSelf: isSender ? "flex-end" : "flex-start",
                    marginBottom: 20,
                    flexDirection: "row",
                }}
            >
                {isSender ? (
                    <Image
                        style={(style = [ChatScreenStyle.imgMsgStyle, { right: 0 }])}
                        resizeMode="cover"
                        source={require("../../../Resources/Images/Feedback/ChatAngleRight.png")}
                    />
                ) : (
                    <Image
                        style={[ChatScreenStyle.imgMsgStyle, { left: 0 }]}
                        resizeMode="cover"
                        source={require("../../../Resources/Images/Feedback/ChatAngleLeft.png")}
                    />
                )}
                <View
                    style={{
                        width: "96%",
                        backgroundColor: isSender ? constant.senderBGColor : "white",
                        marginLeft: isSender ? 0 : 14,
                        alignSelf: isSender ? "flex-end" : "auto",
                        borderRadius: 5,
                        borderColor: "transparent",
                        borderWidth: 1,
                        // marginBottom: 20,
                    }}
                >
                    {item.display_image === "" ? (
                        <View>
                            <Text style={{ fontFamily: constant.themeFont, fontSize: 12, margin: 2, marginLeft: 8 }}>
                                {item.message}
                            </Text>
                            <Text
                                style={{
                                    fontFamily: constant.themeFont,
                                    fontSize: 11,
                                    alignSelf: "flex-end",
                                    margin: 2,
                                    marginRight: 8,
                                }}
                            >
                                {item.timeAgo}
                            </Text>
                        </View>
                    ) : (
                        // <Image resi/>
                        // <View style={{}}>
                        <TouchableOpacity
                            onPress={() => {
                                this.showImage = item.display_image;
                                this.setState({ isShowImage: !this.state.isShowImage });
                            }}
                        >
                            <ImageLoad
                                style={{
                                    height: 135,
                                    width: "100%",
                                    // borderColor: "transparent",
                                    // borderRadius: 10,
                                    // borderWidth: 1,
                                }}
                                borderRadius={5}
                                isShowActivity={false}
                                // resizeMode="contain"
                                placeholderSource={require("../../../Resources/Images/DefaultProductImage.png")}
                                source={{
                                    uri: item.display_image,
                                }}
                            >
                                <View
                                    style={{
                                        position: "absolute",
                                        bottom: 2,
                                        right: 5,
                                        backgroundColor: "lightgray",
                                    }}
                                >
                                    <Text
                                        style={{
                                            fontFamily: constant.themeFont,
                                            fontSize: 11,
                                            alignSelf: "flex-end",
                                            color: "black",
                                            // margin: 2,
                                            // marginRight: 8,
                                        }}
                                    >
                                        {item.timeAgo}
                                    </Text>
                                </View>
                            </ImageLoad>
                        </TouchableOpacity>
                        // </View>
                    )}
                    {/* <Text style={{ fontFamily: constant.themeFont, fontSize: 12, margin: 2, marginLeft: 8 }}>
                        {item.message}
                    </Text> */}
                </View>
            </View>
        );
    };

    _renderModalForShowImage = () => {
        return (
            <Modal
                animationType="fade"
                transparent={false}
                visible={this.state.isShowImage}
                onRequestClose={() => {
                    alert("Modal has been closed.");
                }}
            >
                <TouchableWithoutFeedback onPress={() => this.setState({ isShowImage: false })}>
                    <View
                        style={{
                            // flex: 1,
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "black",
                        }}
                    >
                        <View style={ChatScreenStyle.overlayViewStyle} />
                        <ImageLoad
                            style={{
                                height: "100%",
                                width: "100%",
                            }}
                            // borderRadius={5}
                            isShowActivity={false}
                            resizeMode="contain"
                            placeholderSource={require("../../../Resources/Images/DefaultProductImage.png")}
                            source={{
                                uri: this.showImage,
                            }}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        );
    };

    render() {
        return (
            // Main View (Container)
            <View style={ChatScreenStyle.mainContainer}>
                {/* <Spinner
                    {this.state.isShowImage?:
                    visible={this.props.isLoading}
                    cancelable={true}
                    // textContent={"Please wait..."}
                    textStyle={{ color: "#FFF" }}
                /> */}
                {/* <ScrollView style={{ width: "100%" }} contentContainerStyle={styles.scrollView} /> */}
                {this._renderModalForShowImage()}
                <View>
                    {this.props.arrChat.length > 0 ? (
                        <View style={{ justifyContent: "center", alignItems: "center", marginBottom: 50 }}>
                            <FlatList
                                style={{
                                    width: "95%",
                                    marginTop: 10,
                                    // height: "100%",
                                    backgroundColor: "transparent",
                                }}
                                ref="chatList"
                                data={this.props.arrChat}
                                keyExtractor={(item, index) => item.userChatId.toString()}
                                renderItem={this._renderChatItem.bind(this)}
                                showsHorizontalScrollIndicator={false}
                                directionalLockEnabled
                                // ListFooterComponent={this._renderFooter.bind(this)}
                            />
                        </View>
                    ) : (
                        <Text> No Chat </Text>
                    )}
                    <View
                        style={{
                            height: 50,
                            flexDirection: "row",
                            position: "absolute",
                            bottom: 0,
                            justifyContent: "space-between",
                            backgroundColor: "white",
                            width: "100%",
                        }}
                    >
                        <View style={{ justifyContent: "center", alignItems: "center", width: "15%" }}>
                            <Image
                                style={{ height: 25, width: 25 }}
                                resizeMode="cover"
                                source={require("../../../Resources/Images/Feedback/cameraIcon.png")}
                            />
                        </View>
                        <TextInput
                            style={{ borderColor: "transparent", borderWidth: 2, flex: 1 }}
                            placeholder="Type a message"
                            onChangeText={text => this.setState({ txtMsg: text })}
                            value={this.state.txtMsg}
                            numberOfLines={1}
                        />
                        <View style={{ justifyContent: "center", alignItems: "center", width: "20%" }}>
                            <TouchableOpacity onPress={this._onPressSendMsg}>
                                <Text
                                    style={{
                                        fontFamily: constant.themeFont,
                                        fontSize: 18,
                                        color: constant.grayShadeColor55,
                                        margin: 8,
                                    }}
                                >
                                    Send
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        isLoading: state.chat.isLoading,
        isGetChatSuccess: state.chat.isGetChatSuccess,
        arrChat: state.chat.arrChat,
        error: state.chat.error,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getChat: parameters =>
            dispatch({
                type: constant.actions.getChatRequest,
                payload: { endPoint: constant.APIGetChat, parameters: parameters },
            }),

        sendMessage: parameters =>
            dispatch({
                type: constant.actions.sendMessageRequest,
                payload: { endPoint: constant.APISendMessage, parameters: parameters },
            }),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChatScreen);
