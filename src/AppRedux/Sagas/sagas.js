import * as constant from "../../Helper/Constants";
import { takeLatest, takeEvery, call, put } from "redux-saga/effects";
import { LoginScreenCalls } from "./LoginSagas";
import { SignUpScreenCalls } from "./SignUpSagas";
import { ForgotPasswordScreenCalls } from "./ForgotPasswordSagas";
import { VerifyCodeScreenCalls } from "./VerifyCodeSagas";
import { ResetPasswordScreenCalls } from "./ResetPasswordSagas";
import { CityScreenCalls } from "./CitySagas";
import { AreaScreenCalls } from "./AreaSagas";
import { StoreScreenCalls } from "./StoreSagas";
import { SelectTimeScreenCalls } from "./SelectTimeSagas";
import { CategoryScreenCalls } from "./CategorySagas";
import { AddressListScreenCalls } from "./AddressListSagas";
import { SubCategoryScreenCalls } from "./SubCategorySagas";

// watcher saga: watches for actions dispatched to the store, starts worker saga
export function* watcherSaga(action) {
    // Login/SignUp Flow
    // Login Screen
    yield takeEvery(constant.actions.loginRequest, LoginScreenCalls);
    yield takeEvery(constant.actions.FBLoginRequest, LoginScreenCalls);

    // SignUp Screen
    yield takeEvery(constant.actions.signUpRequest, SignUpScreenCalls);

    // Forgot Password Screen
    yield takeEvery(constant.actions.forgotPasswordRequest, ForgotPasswordScreenCalls);

    // Verify Code Screen
    yield takeEvery(constant.actions.verifyCodeRequest, VerifyCodeScreenCalls);
    yield takeEvery(constant.actions.verifyPhoneRequest, VerifyCodeScreenCalls);

    // Reset Password Screen
    yield takeEvery(constant.actions.resetPasswordRequest, ResetPasswordScreenCalls);

    // Post Login/SignUp Flow
    // City Screen
    yield takeEvery(constant.actions.getCityRequest, CityScreenCalls);

    // Area Screen
    yield takeEvery(constant.actions.getAreaRequest, AreaScreenCalls);

    // Store Screen
    yield takeEvery(constant.actions.getStoreRequest, StoreScreenCalls);
    yield takeEvery(constant.actions.setStoreRequest, StoreScreenCalls);

    // SelectTime Screen
    yield takeEvery(constant.actions.getOrderTimeSessionRequest, SelectTimeScreenCalls);

    // Category Screen
    yield takeEvery(constant.actions.getCategoryRequest, CategoryScreenCalls);
    yield takeEvery(constant.actions.getBannerRequest, CategoryScreenCalls);

    // SubCategory Screen
    yield takeEvery(constant.actions.getSubCategoryRequest, SubCategoryScreenCalls);
    
    // Address List Screen
    yield takeEvery(constant.actions.getAddressRequest, AddressListScreenCalls);
    yield takeEvery(constant.actions.deleteAddressRequest, AddressListScreenCalls);
}
