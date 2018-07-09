/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    FlatList,
    Image,
    ScrollView,
    TouchableWithoutFeedback,
    Platform,
    AsyncStorage,
} from "react-native";

import * as constant from "../../../../Helper/Constants";

// Redux
import { connect } from "react-redux";

// Libs
import CollapsibleList from "react-native-collapsible-list";

// Common Utilities
import * as CommonUtilities from "../../../../Helper/CommonUtilities";

// Loading View
import Spinner from "react-native-loading-spinner-overlay";
import Icon from "react-native-vector-icons/EvilIcons";

// Localization
import baseLocal from "../../../../Resources/Localization/baseLocalization";

// Component Style
import styles from "./SelectTimeScheduleStyle";

// Variable
const arrTimeInterval = ["00", "10", "20", "30", "40", "50"];

class SelectTimeScheduleScreen extends Component {
    constructor(props) {
        super(props);

        baseLocal.locale = global.currentAppLanguage;
        // this._onPressCalendarDate = this._onPressCalendarDate.bind(this)
        this.state = {
            arrSetTimeSlote: [],
            arrOrderBookedTimeSlote: [],
            selectedTimeSlot: null,
            crntStoreTime: "",
            storeTime: new Date().getTime(),
            isTimeSlotOpen: false,
        };
        this.numberOfVisibleItems = 1;
        this.crntOpenTimeSlot = [];
    }

    static navigationOptions = ({ navigation }) => ({
        headerLeft: (
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                        onPress={() => {
                            // console.log("Nav Params :==> ",navigation.state.params);
                            if (navigation.state.params != undefined && navigation.state.params.category != undefined) {
                                navigation.goBack();
                            } else {
                                navigation.navigate("DrawerToggle");
                            }
                        }}
                    >
                        <Icon
                            name={
                                navigation.state.params != undefined && navigation.state.params.category != undefined
                                    ? "arrow-left"
                                    : "navicon"
                            }
                            style={{ marginLeft: 10 }}
                            size={35}
                            color="white"
                        />
                    </TouchableOpacity>
                    <Text style={styles.headerText}> Meghathy </Text>
                </View>
            </View>
        ),
        headerStyle: {
            backgroundColor: "#CF2526",
        },
    });

    componentDidMount() {
        this._getAPIGetOrderTimeSession();
    }

    componentWillReceiveProps(newProps) {
        if (newProps.isSuccess === true && newProps.objOrderBookedTimeSlote != null) {
            let storeDate = new Date(newProps.objOrderBookedTimeSlote.storeTime);
            this.setState(
                {
                    arrOrderBookedTimeSlote: newProps.objOrderBookedTimeSlote.orderSlots,
                    crntStoreTime: newProps.objOrderBookedTimeSlote.storeTime,
                    storeTime: storeDate.getTime(),
                },
                () => {
                    this._getRemainingHours();
                    this.storeCrntTimeInterval = setInterval(this._timerForStoreCurrentTime, 1000);
                }
            );
        } else if (newProps.isSetTimeSuccess === true) {
            this.props.parentScreen.setState(
                { selectTimeScreenVisible: false },
                () => this.props.parentScreen.props.getUserBookedSession()
            );
        }
    }

    componentWillUnmount() {
        clearInterval(this.storeCrntTimeInterval);
    }

    _displayStoreTime() {
        return new Date(this.state.storeTime).toLocaleTimeString("en-us");

        // let storeDateTemp = new Date(this.state.storeTime)
        // let hh = storeDateTemp.getHours()
        // let mm = storeDateTemp.getMinutes()
        // let ss = storeDateTemp.getSeconds()
        // let am_pm = ""
        // hh > 11 ? am_pm = "PM" : am_pm = "AM"
        // hh = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh
        // hh = hh < 10 ? "0" + hh : hh
        // mm = mm < 10 ? "0" + mm : mm
        // ss = ss < 10 ? "0" + ss : ss

        // return hh + ":" + mm + ":" + ss + " " + am_pm
    }

    _timerForStoreCurrentTime = () => {
        this.setState({
            storeTime: this.state.storeTime + 1000,
        });
    };

    // Convert Time into 12hrs Formate
    _convertHourFormate = (isTitle, hours) => {
        // let convertHour = ""
        if (isTitle) {
            if (hours === 12 || hours === 24) {
                return hours === 12 ? "12pm" : "12am";
            } else if (hours > 12) {
                return `${hours - 12}pm`;
            } else {
                return `${hours}am`;
            }
        } else {
            let hour1 = hours.split(" - ")[0].split(":")[0];
            let hour2 = hours.split(" - ")[1].split(":")[0];
            let minute1 = hours.split(" - ")[0].split(":")[1];
            let minute2 = hours.split(" - ")[1].split(":")[1];
            hour1 = hour1 == 0 ? 12 : hour1 > 12 ? hour1 - 12 : hour1;
            hour2 = hour2 == 0 ? 12 : hour2 > 12 ? hour2 - 12 : hour2;
            return hour1 + ":" + minute1 + " - " + hour2 + ":" + minute2;
        }
    };

    // Check Time Slot Available Status
    _checkTimeSlotAvailableStatus = timeSlot => {
        let bookedTimeSlotCount = 0;
        timeSlot.map(item => {
            if (item.isBooked) {
                bookedTimeSlotCount = bookedTimeSlotCount + 1;
            }
        });

        if (bookedTimeSlotCount === 6) {
            return constant.themeColor;
        } else if (bookedTimeSlotCount < 6 && bookedTimeSlotCount > 0) {
            return constant.themeYellowColor;
        } else {
            return constant.themeGreenColor;
        }
    };

    // Check Time Slot Available
    _getBookedTimeSlot = (checkeTimeSlot, strCheckTime) => {
        let objSlot = this.state.arrOrderBookedTimeSlote[0].otherBookTime;

        var bookedOrderTimeSlot = [];
        bookedOrderTimeSlot = objSlot[`slot${checkeTimeSlot}`];

        if (bookedOrderTimeSlot != undefined && bookedOrderTimeSlot != null && bookedOrderTimeSlot.length > 0) {
            for (let index = 0; index < 6; index++) {
                const bookedTimeSlotElement = bookedOrderTimeSlot[index];
                if (bookedTimeSlotElement && bookedTimeSlotElement.includes(checkeTimeSlot)) {
                    return true;
                }
            }
        }
        return false;
    };

    // Create Time Slot in 10 Minutes Gap
    _creatTimeSlotWithTime = timeslote => {
        let arrTimeSlot = [];
        let oldTimeSlot = timeslote;
        // timeslote = this._convertHourFormate(false, timeslote);
        for (let index = 0; index < arrTimeInterval.length; index++) {
            let showTimeSlotTitle = "";
            if (index === arrTimeInterval.length - 1) {
                showTimeSlotTitle = `${timeslote}:${arrTimeInterval[index]} - ${timeslote + 1}:${arrTimeInterval[0]}`;
            } else {
                showTimeSlotTitle = `${timeslote}:${arrTimeInterval[index]} - ${timeslote}:${
                    arrTimeInterval[index + 1]
                }`;
            }
            let timeSlotStatus = {};
            timeSlotStatus["title"] = showTimeSlotTitle;
            timeSlotStatus["isBooked"] = this._getBookedTimeSlot(oldTimeSlot, arrTimeInterval[index]);
            arrTimeSlot.push(timeSlotStatus);
        }

        return arrTimeSlot;
    };

    // API Call for Get Booked Time Slotes
    _getAPIGetOrderTimeSession = () => {
        let cityId = "";
        let orderMasterScreen = this.props.parentScreen.props.parentScreen;
        if (orderMasterScreen.selectedAddress != null) {
            cityId = orderMasterScreen.selectedAddress.cityId;
        } else {
            AsyncStorage.getItem(constant.keyCurrentCity).then(value => (cityId = value.PkId));
        }

        var orderTimeSessionParameters = {
            city_id: cityId,
            date: this.props.parentScreen.selectedDay.dateString,
            dynamic_hour: true,
        };

        this.props.getOrderTimeSession(orderTimeSessionParameters);
    };

    // Get Remaining Hours and Make Time Slot for order
    _getRemainingHours() {
        let today = new Date(this.state.crntStoreTime);
        var todayHour = today.getHours();
        var remainigHours = 0;
        var nextDay = new Date(today);
        let selectedDate = this.state.arrOrderBookedTimeSlote[0].date;
        let storeDate = today.toISOString().substring(0, 10);

        nextDay.setDate(today.getDate() + 1);
        if (selectedDate === storeDate) {
            nextDay.setHours(0, 0, 0, 0);
            var delta = Math.abs(nextDay.getTime() - today.getTime()) / 1000;
            remainigHours = Math.floor(delta / 3600);
        } else {
            todayHour = Number(global.currentSettings["working-hours"].start.substring(0, 2));
            remainigHours = Number(global.currentSettings["working-hours"].end.substring(0, 2));
        }

        let arrRemainig = [];
        let timeSloteData = {};
        timeSloteData["time"] = todayHour;
        timeSloteData["timeSlot"] = this._creatTimeSlotWithTime(todayHour);
        timeSloteData["isOpen"] = false;
        arrRemainig.push(timeSloteData);

        for (let index = 0; index < remainigHours; index++) {
            todayHour = todayHour + 1;
            let newTimeSloteData = {};
            newTimeSloteData["time"] = todayHour;
            newTimeSloteData["timeSlot"] = this._creatTimeSlotWithTime(todayHour);
            newTimeSloteData["isOpen"] = false;
            arrRemainig.push(newTimeSloteData);
        }
        // console.log("TimeSlot In Json :===> ", arrRemainig);
        this.setState({ arrSetTimeSlote: arrRemainig });
    }

    _checkedSlotBookedByCrntUser = slot => {
        if (this.state.selectedTimeSlot != null && this.state.selectedTimeSlot.title === slot.title) {
            return true;
        }

        return false;
    };

    _onPressSave() {
        if (this.state.selectedTimeSlot === null) {
            CommonUtilities.showAlert("Please select a time slot");
            return;
        }

        let parent = 0;
        AsyncStorage.getItem(constant.keyScheduleOrderParent).then(value => (parent = value));

        let cityId = "";
        let orderMasterScreen = this.props.parentScreen.props.parentScreen;
        if (orderMasterScreen.selectedAddress != null) {
            cityId = orderMasterScreen.selectedAddress.cityId;
        } else {
            AsyncStorage.getItem(constant.keyCurrentCity).then(value => (cityId = value.PkId));
        }

        var setOrderTimeSessionParameters = {
            city_id: cityId,
            parent: parent,
            date: this.props.parentScreen.selectedDay.dateString,
            time: this.state.selectedTimeSlot.title.split(" - ")[0] + ":00",
        };
        this.props.setOrderTimeSession(setOrderTimeSessionParameters);
    }

    // Render Methods
    _renderTagItem = ({ item, index }) => {
        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    this.setState({
                        selectedTimeSlot: item,
                    });
                }}
            >
                <View
                    style={[
                        styles.tagBtnStyle,
                        {
                            backgroundColor: this._checkedSlotBookedByCrntUser(item)
                                ? constant.themeGreenColor
                                : item.isBooked
                                    ? constant.themeColor
                                    : "lightgray",
                        },
                    ]}
                >
                    <Text style={styles.headerText}> {this._convertHourFormate(false, item.title)} </Text>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    _renderItem = ({ item }) => {
        let timeSlotStatusColor = this._checkTimeSlotAvailableStatus(item.timeSlot);
        let imgForTimeSlotViewOpenStatus = item.isOpen
            ? require("../../../../Resources/Images/Order/upArrowRetract.png")
            : require("../../../../Resources/Images/Order/downArrowExpand.png");
        return (
            <View
                style={{
                    flex: 1,
                }}
            >
                <CollapsibleList
                    numberOfVisibleItems={1}
                    animationConfig={{ duration: 200 }}
                    onToggle={collapsed => {
                        item.isOpen = collapsed;
                        this.setState({ isTimeSlotOpen: collapsed });
                    }}
                    buttonContent={
                        <View
                            style={{
                                width: "100%",
                                height: 40,
                                backgroundColor: "white",
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <View
                                style={{
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Text style={styles.txtTimeSlotTitle}>
                                    {this._convertHourFormate(true, item.time)}-{this._convertHourFormate(
                                        true,
                                        item.time + 1
                                    )}
                                </Text>
                            </View>

                            <View
                                style={{
                                    backgroundColor: "white",
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    right: 0,
                                }}
                            >
                                <Image
                                    style={{ width: 20, height: 20, margin: 10 }}
                                    source={imgForTimeSlotViewOpenStatus}
                                />

                                <View
                                    style={{
                                        height: "100%",
                                        width: 4,
                                        backgroundColor: timeSlotStatusColor,
                                        right: 0,
                                    }}
                                />
                            </View>
                        </View>
                    }
                    items={[
                        <View style={styles.collapsibleItem} />,
                        <View
                            style={{
                                borderBottomWidth: StyleSheet.hairlineWidth,
                                borderColor: "#CCC",
                                paddingBottom: 10,
                            }}
                        >
                            <FlatList
                                keyExtractor={(item, index) => item.title}
                                extraData={this.state}
                                data={item.timeSlot}
                                horizontal={false}
                                renderItem={this._renderTagItem}
                                numColumns={3}
                            />
                        </View>,
                        <View style={styles.collapsibleItem} />,
                    ]}
                />
            </View>
        );
    };

    _renderTimeSlotStatusInstructorView = () => {
        let arrTimeSlotStatus = [
            { status: "Booked", color: constant.themeColor },
            { status: "Available", color: constant.themeGreenColor },
            { status: "Partial", color: constant.themeYellowColor },
        ];
        const renderedTimeSlotStatusView = arrTimeSlotStatus.map(timeSlotStatus => {
            return (
                <View style={styles.slotStatusIndicatorView} key={timeSlotStatus.status}>
                    <View
                        style={{
                            width: 4,
                            height: "60%",
                            backgroundColor: timeSlotStatus.color,
                        }}
                    />
                    <Text style={styles.txtTimeSlotStatus}>{timeSlotStatus.status}</Text>
                </View>
            );
        });

        return renderedTimeSlotStatusView;
    };

    _renderCustomNavigationView = () => {
        return (
            // Platform.OS === "ios"
            <View>
                <View style={styles.navigationView}>
                    <View style={{ flexDirection: "row" }}>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.parentScreen.setState({ selectTimeScreenVisible: false });
                            }}
                        >
                            <Icon
                                name={"arrow-left"}
                                style={{ marginLeft: 10, marginTop: 10 }}
                                size={25}
                                color="white"
                            />
                        </TouchableOpacity>
                        <Text style={styles.navigationButtonText}> Time Slots </Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            this._onPressSave();
                            // this._onPressCalendarDate();
                        }}
                    >
                        <Text style={[styles.navigationButtonText, {marginRight:10}]}> Save </Text>
                    </TouchableOpacity>
                </View>
                {this._renderDateTimeView()}
            </View>
        );
    };

    _renderDateTimeView = () => {
        return (
            <View style={styles.dateTimeView}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={[styles.dateTimeViewText, { width: "70%" }]}>
                        {baseLocal.t("Select time slot for date")}
                    </Text>
                    <Text style={[styles.dateTimeViewText, { fontWeight: "bold" }]}>
                        {CommonUtilities.dateInDDMMYYYYFormat(this.props.parentScreen.selectedDay.dateString)}
                    </Text>
                </View>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={[styles.dateTimeViewText, { width: "70%" }]}>{baseLocal.t("Store current time")}</Text>
                    <Text style={[styles.dateTimeViewText, { fontWeight: "bold" }]}>{this._displayStoreTime()}</Text>
                </View>
            </View>
        );
    };

    render() {
        return (
            // Main View (Container)
            <View style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1, height: "100%" }}>
                    {/* ----- Navigation View View ----- */}
                    {this._renderCustomNavigationView()}

                    {/* ----- Time Slote View ----- */}
                    <View style={{ width: "100%", marginBottom: 30 }}>
                        <View>
                            <FlatList
                                style={{ width: "100%", marginBottom: 30 }}
                                keyExtractor={item => item.time.toString()}
                                extraData={this.state}
                                ref={flatList => {
                                    this.timeslote = flatList;
                                }}
                                data={this.state.arrSetTimeSlote}
                                renderItem={this._renderItem}
                            />
                        </View>
                    </View>
                    {/* ----- Time Slot Status Instruction View ----- */}
                    <View
                        style={{
                            justifyContent: "space-between",
                            flexDirection: "row",
                            backgroundColor: "white",
                            position: "absolute",
                            bottom: 0,
                        }}
                    >
                        {this._renderTimeSlotStatusInstructorView()}
                    </View>
                </SafeAreaView>
            </View>
        );
    }
}

function mapStateToProps(state, props) {
    return {
        isLoading: state.selectTime.isLoading,
        isSuccess: state.selectTimeSchedule.isSetTimeSuccess === true ? false : state.selectTime.isSuccess,
        isSetTimeSuccess: state.selectTimeSchedule.isSetTimeSuccess,
        objOrderBookedTimeSlote: state.selectTime.objOrderBookedTimeSlote,
        error: state.selectTime.error,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        getOrderTimeSession: parameters =>
            dispatch({
                type: constant.actions.getOrderTimeSessionRequest,
                payload: {
                    endPoint: constant.APIGetOrderTimeSession,
                    parameters: parameters,
                },
            }),
        setOrderTimeSession: parameters =>
            dispatch({
                type: constant.actions.setOrderTimeSessionRequest,
                payload: {
                    endPoint: constant.APISetOrderTimeSession,
                    parameters: parameters,
                },
            }),
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SelectTimeScheduleScreen);
