/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import { Platform } from "react-native";
import {
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    RefreshControl,
    TouchableWithoutFeedback,
    Image,
} from "react-native";

import { connect } from "react-redux"; // Redux
import * as constant from "../../../../Helper/Constants"; // Constants
import * as CommonUtilities from "../../../../Helper/CommonUtilities"; // Common Utilities
import * as networkUtility from "../../../../Helper/NetworkUtility"; // Network Utility
import Spinner from "react-native-loading-spinner-overlay"; // Loading View
import baseLocal from "../../../../Resources/Localization/baseLocalization"; // Localization

import moment from "moment"; // Date/Time Conversition

// Styles
import styles from "./OrderStatusListStyle";

class OrderStatusListScreen extends Component {
    constructor(props) {
        super(props);

        baseLocal.locale = global.currentAppLanguage;
        this.state = {
            currentPage: 1,
            lastPage: 1,
        };
    }

    static navigationOptions = CommonUtilities.navigationView(baseLocal.t("Order Status"), false);

    componentDidMount() {
        this._getOrderHistory();
    }

    componentWillReceiveProps(newProps) {}

    // Mics Methods

    _getOrderHistory = (isRefresh = false, isLoadMore = false) => {
        let orderHistoryPage = 1;
        if (!isRefresh && isLoadMore && this.props.currentPage < this.props.lastPage) {
            orderHistoryPage = this.props.currentPage + 1;
        }

        var orderHistoryParameters = {
            page: orderHistoryPage,
            active: 1
        };

        this.props.getOrderHistory(orderHistoryParameters);
    };

    _onRefresh() {
        this._getOrderHistory(true);
        constant.debugLog("On Refresh call....");
    }

    _callLoadMore() {
        console.log("Call Load More .....");

        if (this.props.currentPage < this.props.lastPage) {
            this._getOrderHistory(false, true);
        }
    }

    // OnPress Methods

    _onPressOrderItem = item => {
        this.props.navigation.navigate("OrderStatusDetailScreen", { orderItem: item });
    };

    // Render Methods

    _renderDateAndTimeView = value => {
        return (
            <View style={{ margin: 4, flexDirection: "row", marginTop: 8 }}>
                <Image
                    style={{ width: 20, height: 20, marginRight: 8 }}
                    source={require("../../../../Resources/Images/Order/TimeIcon.png")}
                    resizeMode="contain"
                />
                <Text style={[styles.normalTitleText, { marginLeft: 8 }]}>{value}</Text>
            </View>
        );
    };

    _renderAddressView = value => {
        return (
            <View style={{ margin: 4, flexDirection: "row", marginTop: 8 }}>
                <Image
                    style={{ width: 20, height: 20, marginRight: 8 }}
                    source={require("../../../../Resources/Images/Order/LocationIcon.png")}
                    resizeMode="contain"
                />
                <Text style={[styles.normalTitleText, { marginLeft: 8, width: "90%" }]}>{value}</Text>
            </View>
        );
    };

    _renderOrderHistoryItem = ({ item, index }) => {
        let orderStatusColor = item.status === constant.kOrderStatusDelivered ? constant.themeGreenColor : "gray";
        return (
            <TouchableWithoutFeedback
                style={{ backgroundColor: constant.prodCategoryBGColor }}
                onPress={() => this._onPressOrderItem(item)}
            >
                <View style={styles.orderHistoryItemConstainerStyle}>
                    <View style={{ flex: 1, margin: 8, marginRight: 0 }}>
                        <Text style={[styles.boldTitleText, { marginLeft: 36 }]}>Order Id: {item.displayOrderId}</Text>
                        {this._renderDateAndTimeView(moment(item.orderDeliveryTime).format("DD-MM-YYYY hh:mm A"))}
                        {this._renderAddressView(item.address_meta.address)}
                        <Text style={[styles.normalTitleText, , { marginLeft: 36, marginTop: 4 }]}>
                            Payment Mode: {item.paymentMode}
                        </Text>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginLeft: 36,
                                marginTop: 4,
                            }}
                        >
                            <Text style={[styles.boldTitleText, { color: constant.themeColor, marginTop: 4 }]}>
                                SAR: {item.orderTotal}
                            </Text>
                            <View style={[styles.orderStatusViewStyle, { backgroundColor: orderStatusColor }]}>
                                <Text
                                    style={{
                                        color: "white",
                                        fontSize: 12,
                                        fontWeight: "bold",
                                        fontFamily: constant.themeFont,
                                    }}
                                >
                                    {item.status}
                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ width: "10%", justifyContent: "center", alignItems: "center" }}>
                        <Image
                            style={{ width: 22, height: 22 }}
                            source={require("../../../../Resources/Images/Order/RightAero.png")}
                            resizeMode="contain"
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    render() {
        return (
            // Main View (Container)
            <View>
                <SafeAreaView style={[styles.mainContainer, { backgroundColor: constant.darkGrayBGColor }]}>
                    {this.props.arrOrderHistory.length > 0 ? (
                        <FlatList
                            style={{
                                width: "95%",
                                // height: "100%",
                                backgroundColor: "transparent",
                            }}
                            ref={flatList => {
                                this.orderHistoryList = flatList;
                            }}
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.props.isRefreshing}
                                    onRefresh={this._onRefresh.bind(this)}
                                />
                            }
                            data={this.props.arrOrderHistory}
                            keyExtractor={(item, index) => item.orderId.toString()}
                            renderItem={this._renderOrderHistoryItem.bind(this)}
                            showsHorizontalScrollIndicator={false}
                            removeClippedSubviews={false}
                            directionalLockEnabled
                            onEndReached={this._callLoadMore.bind(this)}
                            onEndReachedThreshold={0.5}
                            // ListFooterComponent={this._renderFooter.bind(this)}
                        />
                    ) : (
                        <Spinner visible={this.props.isLoading} cancelable={true} textStyle={{ color: "#FFF" }} />
                    )}
                </SafeAreaView>
            </View>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        isLoading: state.orderHistory.isLoading,
        isRefreshing: state.orderHistory.isRefreshing,
        isOrderHistorySuccess: state.orderHistory.isOrderHistorySuccess,
        arrOrderHistory: state.orderHistory.arrOrderHistory,
        currentPage: state.orderHistory.currentPage,
        lastPage: state.orderHistory.lastPage,
        error: state.orderHistory.error,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getOrderHistory: parameters =>
            dispatch({
                type: constant.actions.getOrderHistoryRequest,
                payload: { endPoint: constant.APIGetOrderHistory, parameters: parameters },
            }),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(OrderStatusListScreen);
