"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SosAlertStatus = exports.LedgerAccount = exports.LedgerEntryType = exports.PaymentStatus = exports.PaymentMethod = exports.JobOfferStatus = exports.ActorType = exports.VALID_BOOKING_TRANSITIONS = exports.BookingStatus = exports.CuisineType = exports.ServiceType = exports.DocumentStatus = exports.DocumentType = exports.CookVerificationStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["CUSTOMER"] = "CUSTOMER";
    UserRole["COOK"] = "COOK";
    UserRole["ADMIN"] = "ADMIN";
    UserRole["OPS"] = "OPS";
})(UserRole || (exports.UserRole = UserRole = {}));
var CookVerificationStatus;
(function (CookVerificationStatus) {
    CookVerificationStatus["DRAFT"] = "DRAFT";
    CookVerificationStatus["SUBMITTED"] = "SUBMITTED";
    CookVerificationStatus["UNDER_REVIEW"] = "UNDER_REVIEW";
    CookVerificationStatus["VERIFIED"] = "VERIFIED";
    CookVerificationStatus["REJECTED"] = "REJECTED";
    CookVerificationStatus["SUSPENDED"] = "SUSPENDED";
})(CookVerificationStatus || (exports.CookVerificationStatus = CookVerificationStatus = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["AADHAAR"] = "AADHAAR";
    DocumentType["PAN"] = "PAN";
    DocumentType["POLICE_VERIFICATION"] = "POLICE_VERIFICATION";
    DocumentType["FOOD_SAFETY_TRAINING"] = "FOOD_SAFETY_TRAINING";
    DocumentType["PROFILE_PHOTO"] = "PROFILE_PHOTO";
    DocumentType["KITCHEN_PHOTO"] = "KITCHEN_PHOTO";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "PENDING";
    DocumentStatus["APPROVED"] = "APPROVED";
    DocumentStatus["REJECTED"] = "REJECTED";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
var ServiceType;
(function (ServiceType) {
    ServiceType["BREAKFAST"] = "BREAKFAST";
    ServiceType["LUNCH"] = "LUNCH";
    ServiceType["DINNER"] = "DINNER";
    ServiceType["FULL_DAY"] = "FULL_DAY";
    ServiceType["PARTY_SPECIAL"] = "PARTY_SPECIAL";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
var CuisineType;
(function (CuisineType) {
    CuisineType["SOUTH_INDIAN"] = "SOUTH_INDIAN";
    CuisineType["NORTH_INDIAN"] = "NORTH_INDIAN";
    CuisineType["KARNATAKA_SPECIAL"] = "KARNATAKA_SPECIAL";
    CuisineType["BENGALI"] = "BENGALI";
    CuisineType["MAHARASHTRIAN"] = "MAHARASHTRIAN";
    CuisineType["CONTINENTAL"] = "CONTINENTAL";
    CuisineType["CHINESE"] = "CHINESE";
    CuisineType["JAIN_SPECIAL"] = "JAIN_SPECIAL";
    CuisineType["DIET_FITNESS"] = "DIET_FITNESS";
})(CuisineType || (exports.CuisineType = CuisineType = {}));
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["CREATED"] = "CREATED";
    BookingStatus["PAYMENT_PENDING"] = "PAYMENT_PENDING";
    BookingStatus["SEARCHING"] = "SEARCHING";
    BookingStatus["ASSIGNED"] = "ASSIGNED";
    BookingStatus["EN_ROUTE"] = "EN_ROUTE";
    BookingStatus["ARRIVED"] = "ARRIVED";
    BookingStatus["IN_PROGRESS"] = "IN_PROGRESS";
    BookingStatus["COMPLETED"] = "COMPLETED";
    BookingStatus["CANCELLED"] = "CANCELLED";
    BookingStatus["NO_SHOW"] = "NO_SHOW";
    BookingStatus["REFUNDED"] = "REFUNDED";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
exports.VALID_BOOKING_TRANSITIONS = {
    [BookingStatus.CREATED]: [BookingStatus.PAYMENT_PENDING, BookingStatus.CANCELLED],
    [BookingStatus.PAYMENT_PENDING]: [BookingStatus.SEARCHING, BookingStatus.CANCELLED],
    [BookingStatus.SEARCHING]: [BookingStatus.ASSIGNED, BookingStatus.CANCELLED],
    [BookingStatus.ASSIGNED]: [BookingStatus.EN_ROUTE, BookingStatus.CANCELLED, BookingStatus.SEARCHING],
    [BookingStatus.EN_ROUTE]: [BookingStatus.ARRIVED, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
    [BookingStatus.ARRIVED]: [BookingStatus.IN_PROGRESS, BookingStatus.CANCELLED, BookingStatus.NO_SHOW],
    [BookingStatus.IN_PROGRESS]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    [BookingStatus.COMPLETED]: [BookingStatus.REFUNDED],
    [BookingStatus.CANCELLED]: [BookingStatus.REFUNDED],
    [BookingStatus.NO_SHOW]: [BookingStatus.REFUNDED],
    [BookingStatus.REFUNDED]: [],
};
var ActorType;
(function (ActorType) {
    ActorType["CUSTOMER"] = "CUSTOMER";
    ActorType["COOK"] = "COOK";
    ActorType["ADMIN"] = "ADMIN";
    ActorType["SYSTEM"] = "SYSTEM";
})(ActorType || (exports.ActorType = ActorType = {}));
var JobOfferStatus;
(function (JobOfferStatus) {
    JobOfferStatus["PENDING"] = "PENDING";
    JobOfferStatus["ACCEPTED"] = "ACCEPTED";
    JobOfferStatus["DECLINED"] = "DECLINED";
    JobOfferStatus["EXPIRED"] = "EXPIRED";
})(JobOfferStatus || (exports.JobOfferStatus = JobOfferStatus = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["UPI"] = "UPI";
    PaymentMethod["CARD"] = "CARD";
    PaymentMethod["WALLET"] = "WALLET";
    PaymentMethod["CASH"] = "CASH";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["AUTHORIZED"] = "AUTHORIZED";
    PaymentStatus["CAPTURED"] = "CAPTURED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var LedgerEntryType;
(function (LedgerEntryType) {
    LedgerEntryType["CREDIT"] = "CREDIT";
    LedgerEntryType["DEBIT"] = "DEBIT";
})(LedgerEntryType || (exports.LedgerEntryType = LedgerEntryType = {}));
var LedgerAccount;
(function (LedgerAccount) {
    LedgerAccount["CUSTOMER_WALLET"] = "CUSTOMER_WALLET";
    LedgerAccount["COOK_WALLET"] = "COOK_WALLET";
    LedgerAccount["PLATFORM_ESCROW"] = "PLATFORM_ESCROW";
    LedgerAccount["PLATFORM_REVENUE"] = "PLATFORM_REVENUE";
    LedgerAccount["PAYMENT_GATEWAY_RECEIVABLE"] = "PAYMENT_GATEWAY_RECEIVABLE";
    LedgerAccount["TAX_PAYABLE"] = "TAX_PAYABLE";
})(LedgerAccount || (exports.LedgerAccount = LedgerAccount = {}));
var SosAlertStatus;
(function (SosAlertStatus) {
    SosAlertStatus["TRIGGERED"] = "TRIGGERED";
    SosAlertStatus["ACKNOWLEDGED"] = "ACKNOWLEDGED";
    SosAlertStatus["RESOLVED"] = "RESOLVED";
    SosAlertStatus["FALSE_ALARM"] = "FALSE_ALARM";
})(SosAlertStatus || (exports.SosAlertStatus = SosAlertStatus = {}));
//# sourceMappingURL=index.js.map