/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from "react";
import {
    Platform,
    Text,
    View,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    SafeAreaView,
    FlatList,
    AsyncStorage,
    Animated,
    Dimensions,
    TextInput,
} from "react-native";

// Redux
import { connect } from "react-redux";

// Common file
import * as CommonUtilities from "../../../../Helper/CommonUtilities";
import * as constant from "../../../../Helper/Constants";
import * as cartFunc from "../../../../Helper/Functions/Cart";

// Lib
import ImageLoad from "react-native-image-placeholder";

// Components Style
import CartStyle from "./CartScreenStyle";

// Localization
import baseLocal from "../../../../Resources/Localization/baseLocalization";

// Variable
const orderNowViewHeight = (12 * Dimensions.get("window").height) / 100;

class CartScreen extends Component {
    constructor(props) {
        super(props);
        // Class Props
        this.y_translate = new Animated.Value(0);
        //Class State
        this.state = {
            productQuentity: 0,
            showScheduleOrderNow: false,
        };
    }

    static navigationOptions = CommonUtilities.navigationView("Shopping Cart", true);

    // App Life Cycle Methods
    componentDidMount() {
        this.GetOrSaveCartItem(false);

        Animated.spring(this.y_translate, {
            toValue: orderNowViewHeight,
        }).start();
    }

    componentWillUnmount() {
        this.GetOrSaveCartItem(true);
        this._onPressShowHideScheduleOrderNowBtns();
    }

    componentWillUpdate() {
        this.GetOrSaveCartItem(true);
    }

    // Mics Methods
    async GetOrSaveCartItem(isSaveCartItem) {
        try {
            if (isSaveCartItem) {
                await AsyncStorage.setItem("cartItems", JSON.stringify(global.arrCartItems));
            } else {
                var oldArrCartItems = await AsyncStorage.getItem("cartItems");
                if (oldArrCartItems !== null) {
                    // We have data!!
                    global.arrCartItems = JSON.parse(oldArrCartItems);
                    // global.arrCartItems.map(cartItem => {
                    //     this.state.productDataList.map(item => {
                    //         if (cartItem.PkId === item.PkId) {
                    //             item.totalAddedProduct = cartItem.totalAddedProduct;
                    //         }
                    //     });
                    // });
                    this.forceUpdate();
                }
            }
        } catch (error) {
            isSaveCartItem
                ? console.log("Error in save Data :===> ", error)
                : console.log("Error in get Data :===> ", error);
        }
    }

    _onPressAddProduct = item => {
        item.totalAddedProduct = item.totalAddedProduct ? item.totalAddedProduct + 1 : 1;
        this.setState({ productQuentity: this.state.productQuentity + 1 });

        let oldCartItem = cartFunc.findCartItem(item.PkId);

        if (global.arrCartItems.length > 0) {
            if (oldCartItem) {
                let itemIdx = global.arrCartItems.indexOf(oldCartItem);
                global.arrCartItems.splice(itemIdx, 1, item);
            } else {
                global.arrCartItems.push(item);
            }
        } else {
            global.arrCartItems.push(item);
        }
    };

    _onPressRemoveProduct = (item, removeFromList) => {
        if (item.totalAddedProduct > 0) {
            item.totalAddedProduct = item.totalAddedProduct - 1;
            let oldCartItem = cartFunc.findCartItem(item.PkId);
            let itemIdx = global.arrCartItems.indexOf(oldCartItem);

            if (global.arrCartItems.length > 0) {
                if (item.totalAddedProduct === 0 || removeFromList) {
                    global.arrCartItems.splice(itemIdx, 1);
                } else if (oldCartItem) {
                    global.arrCartItems.splice(itemIdx, 1, item);
                } else {
                    global.arrCartItems.push(item);
                }
            } else {
                global.arrCartItems.push(item);
            }
            this.setState({ productQuentity: this.state.productQuentity - 1 });
        }
    };

    _onPressRemoveCartItemFromList = item => {
        CommonUtilities.showAlertYesNo("Are you sure want to remove this item from the cart?", "Megathy").then(
            pressedYes => {
                // User pressed Yes
                constant.debugLog("User pressed Yes");
                this._onPressRemoveProduct(item, true);
            },
            pressedNo => {
                // User pressed No
                constant.debugLog("User pressed No");
            }
        );
    };

    _onPressShowHideScheduleOrderNowBtns = () => {
        // constant.debugLog("orderNow Called ...");

        if (!this.state.showScheduleOrderNow) {
            this.setState(
                {
                    showScheduleOrderNow: true,
                },
                () => {
                    this.y_translate.setValue(0);
                    Animated.spring(this.y_translate, {
                        toValue: -1 * orderNowViewHeight,
                        // friction: 3
                    }).start();
                }
            );
        } else {
            this.setState(
                {
                    showScheduleOrderNow: false,
                },
                () => {
                    this.y_translate.setValue(-1 * orderNowViewHeight);
                    Animated.spring(this.y_translate, {
                        toValue: orderNowViewHeight,
                        friction: 5,
                    }).start();
                }
            );
        }
    };

    _renderPriceCutView = item => {
        return (
            <View>
                <View style={{ alignSelf: "flex-start", justifyContent: "center", backgroundColor: "transparent" }}>
                    <Text style={CartStyle.cartProductPriceLbl}>SAR {item.product_price[0].price}</Text>
                    <View>
                        <View style={CartStyle.cartproductPriceCutView} />
                    </View>
                </View>

                <View style={{ justifyContent: "center", backgroundColor: "transparent" }}>
                    {item.product_price[0].discountType === constant.kProductDiscountPercentage ? (
                        <Text style={CartStyle.cartProductPriceLbl}>
                            SAR {item.product_price[0].discountPrice} ({item.product_price[0].hike}%)
                        </Text>
                    ) : (
                        <Text style={CartStyle.cartProductPriceLbl}>SAR {item.product_price[0].discountPrice}</Text>
                    )}
                </View>
            </View>
        );
    };

    _renderOrderNowModel = () => {
        return (
            <TouchableWithoutFeedback onPress={this._onPressShowHideScheduleOrderNowBtns.bind(this)}>
                <View
                    style={{
                        flex: 1,
                        position: "absolute",
                        left: 0,
                        right: 0,
                        bottom: -1 * orderNowViewHeight,
                    }}
                >
                    <Animated.View
                        style={[
                            CartStyle.ScheduleAndOrderNowViewStyle,
                            {
                                transform: [{ translateY: this.y_translate }],
                            },
                        ]}
                    >
                        <TouchableOpacity
                            style={[CartStyle.scheduleAndOrderBtns, { marginLeft: 20 }]}
                            onPress={this._onPressShowHideScheduleOrderNowBtns.bind(this)}
                        >
                            <Text
                                style={{
                                    fontFamily: constant.themeFont,
                                    fontWeight: "bold",
                                    color: "white",
                                }}
                            >
                                Schedule
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[CartStyle.scheduleAndOrderBtns, { marginRight: 20 }]}
                            onPress={() => {
                                this._onPressShowHideScheduleOrderNowBtns();
                                this.props.navigation.navigate(constant.kOrderMasterScreen);
                            }}
                        >
                            <Text
                                style={{
                                    fontFamily: constant.themeFont,
                                    fontWeight: "bold",
                                    color: "white",
                                }}
                            >
                                Order Now
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    _renderCartItem = ({ item, index }) => {
        return (
            <View style={CartStyle.cartItemCountainer}>
                <ImageLoad
                    style={CartStyle.cartProductImg}
                    isShowActivity={false}
                    placeholderSource={require("../../../../Resources/Images/DefaultProductImage.png")}
                    source={{
                        uri: item.productImageUrl,
                    }}
                />

                <View
                    style={{
                        marginBottom: 5,
                        backgroundColor: "transparent",
                        flex: 1,
                        flexDirection: "column",
                    }}
                >
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <View style={{ marginTop: 3 }}>
                            <Text style={CartStyle.cartProductNameLbl} numberOfLines={2}>
                                {global.currentAppLanguage === constant.languageArabic
                                    ? item.productNameAr
                                    : item.productName}
                            </Text>
                            <Text style={CartStyle.cartProductQuentityLbl}>
                                {item.productQuntity}
                                {global.currentAppLanguage === constant.languageArabic
                                    ? item.productUnitAr
                                    : item.productUnit}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={{ position: "absolute", top: 3, right: 10 }}
                            onPress={this._onPressRemoveCartItemFromList.bind(this, item, true)}
                        >
                            <Image
                                style={CartStyle.selectedProductQuentity}
                                source={require("../../../../Resources/Images/CartScr/BtnRemoveAllProductFromCart.png")}
                            />
                        </TouchableOpacity>
                    </View>

                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            width: "100%",
                        }}
                    >
                        <View>
                            {item.product_price[0].status === constant.kProductDiscountActive ? (
                                this._renderPriceCutView(item)
                            ) : (
                                <Text style={ProductStyles.productPriceLbl}>SAR {item.product_price[0].price}</Text>
                            )}
                        </View>

                        <View
                            style={{
                                marginTop: 3,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginRight: 10,
                            }}
                        >
                            <TouchableOpacity onPress={this._onPressRemoveProduct.bind(this, item, false)}>
                                <Image
                                    style={CartStyle.selectedProductQuentity}
                                    source={require("../../../../Resources/Images/CartScr/BtnRemoveFromCart.png")}
                                />
                            </TouchableOpacity>

                            <Text
                                style={{
                                    fontSize: 15,
                                    fontFamily: constant.themeFont,
                                    margin: 2,
                                }}
                            >
                                {item.totalAddedProduct}
                            </Text>

                            <TouchableOpacity onPress={this._onPressAddProduct.bind(this, item)}>
                                <Image
                                    style={CartStyle.addProductImg}
                                    source={require("../../../../Resources/Images/CartScr/BtnAddToCart.png")}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

    render() {
        return (
            <View
                style={{
                    flex: 1,
                    backgroundColor: constant.darkGrayBGColor,
                }}
            >
                <SafeAreaView
                    style={{
                        flex: 1,
                    }}
                >
                    {global.arrCartItems.length > 0 ? (
                        <FlatList
                            style={{
                                marginBottom: 10,
                            }}
                            ref={flatList => {
                                this.cartList = flatList;
                            }}
                            data={global.arrCartItems}
                            keyExtractor={item => item.PkId.toString()}
                            renderItem={this._renderCartItem.bind(this)}
                            showsHorizontalScrollIndicator={false}
                            removeClippedSubviews={false}
                            directionalLockEnabled
                        />
                    ) : (
                        <View
                            style={{
                                flex: 1,
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <Text style={{ fontSize: 17 }}> Your cart is empty</Text>
                        </View>
                    )}
                    <View style={CartStyle.cartContainer}>
                        <View
                            style={{
                                backgroundColor: "white",
                                width: "45%",
                                flex: 1,
                                marginTop: 1,
                                flexDirection: "row",
                            }}
                        >
                            <TouchableWithoutFeedback onPress={this._onPressShowHideScheduleOrderNowBtns.bind(this)}>
                                <View
                                    style={{
                                        backgroundColor: "#F5F5F5",
                                        width: "45%",
                                        flex: 1,
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
                                        <Image
                                            style={CartStyle.cartImg}
                                            source={require("../../../../Resources/Images/ProductScr/CartImageRed.png")}
                                            resizeMode="contain"
                                        />
                                        <View style={CartStyle.cartBadge}>
                                            <Text style={CartStyle.cartItemLbl}>{cartFunc.getCartItemsCount()}</Text>
                                        </View>
                                    </View>

                                    <View
                                        style={{
                                            justifyContent: "center",
                                            alignItems: "center",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontFamily: constant.themeFont,
                                                fontSize: 10,
                                            }}
                                        >
                                            SAR
                                        </Text>
                                        <Text
                                            style={{
                                                fontFamily: constant.themeFont,
                                                fontSize: 16,
                                                fontWeight: "bold",
                                            }}
                                        >
                                            {cartFunc.getTotalPriceCartItems()}
                                        </Text>
                                    </View>

                                    <View style={{ width: 2, backgroundColor: "lightgray" }} />
                                </View>
                            </TouchableWithoutFeedback>

                            <View
                                style={{
                                    width: "60%",
                                }}
                            >
                                <TextInput
                                    style={{
                                        height: "100%",
                                        borderColor: "gray",
                                        borderWidth: 1,
                                    }}
                                />
                            </View>
                        </View>

                        <TouchableWithoutFeedback onPress={this._onPressShowHideScheduleOrderNowBtns.bind(this)}>
                            <View
                                style={{
                                    backgroundColor: "transparent",
                                    width: "15%",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Image
                                    style={{ height: 25, width: 25 }}
                                    source={require("../../../../Resources/Images/CartScr/BtnRightAero.png")}
                                    resizeMode="contain"
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    {this.state.showScheduleOrderNow ? (
                        <TouchableWithoutFeedback onPress={this._onPressShowHideScheduleOrderNowBtns.bind(this)}>
                            <View style={CartStyle.overlayLayer} />
                        </TouchableWithoutFeedback>
                    ) : null}
                    {this._renderOrderNowModel()}
                </SafeAreaView>
            </View>
        );
    }
}

// Store State in store
function mapStateToProps(state, props) {
    return {};
}

function mapDispatchToProps(dispatch) {
    return {};
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CartScreen);
