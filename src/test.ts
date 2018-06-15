export const testData = JSON.parse(`{
"swagger": "2.0",
  "info": {
    "version": "26",
    "title": "Hotelbird - Web-Check-In Kiosk",
    "description": "<p>Session-based API<p>  <ul> <li>/searchData/{lngBCP47}</li> <li>/bookingByToken/{secureToken}/{lngBCP47}</li> <li>/passData/{lngBCP47}/{optInToken}</li> <li>/itWasNotMe/{secureToken}/{lngBCP47}/companyData</li> <li>/bookingKioskData/{secureToken}</li> </ul> </p>  Listed calls are door openers. In this calls the server return a session cookie (hotelbird_session). This session cookie has to be used in the next calls to authenticate the client to the booking</p> <p> <strong> /organisation/{webToken} </strong> Is open and do not create a new session.",
    "contact": {
      "email": "support@hotelbird.com"
    }
  },
  "host": "api.hotelbird.com",
  "basePath": "/webapi/v1",
  "tags": [
    {
      "name": "Webcheckin",
      "description": "API calls used by WebCheckIn app."
    },
    {
      "name": "Kiosk",
      "description": "API calls used by the kiosk app."
    }
  ],
  "schemes": [
    "https"
  ],
  "paths": {
    "/searchData/{lngBCP47}": {
      "get": {
        "tags": [
          "Webcheckin"
        ],
        "summary": "Requests all organizations with active webcheckin and the reCaptcha site-data",
        "description": "Can be used for a select field in search booking",
        "operationId": "getSearchData",
        "parameters": [
          {
            "name": "lngBCP47",
            "in": "path",
            "description": "Separate frontend integration from backend integration. New lngs on one side are not required on the other side (list sorted by Name/ABC)",
            "required": true,
            "type": "string",
            "default": "DE-de"
          }
        ],
        "responses": {
          "200": {
            "description": "Data Returned",
            "schema": {
              "$ref": "#/definitions/SearchData"
            }
          },
          "404": {
            "$ref": "#/responses/NoOrganizationFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          }
        }
      }
    },
    "/searchBooking": {
      "get": {
        "tags": [
          "Webcheckin"
        ],
        "summary": "Request booking data with user information",
        "description": "",
        "operationId": "searchBooking",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "organisationId",
            "in": "query",
            "description": "Organization id. Listed in organization List",
            "required": true,
            "type": "integer"
          },
          {
            "name": "lastname",
            "in": "query",
            "description": "Last name or booking owner.",
            "required": true,
            "type": "string"
          },
          {
            "name": "reservationId",
            "in": "query",
            "description": "ReservationId from hotel",
            "required": true,
            "type": "string"
          },
          {
            "name": "reCaptureSiteKey",
            "in": "query",
            "description": "Site key for google reCapture",
            "required": true,
            "type": "string"
          },
          {
            "name": "lng",
            "in": "query",
            "description": "BCP-47 Language string for hotel information, checkin pass, ...",
            "required": true,
            "type": "string",
            "default": "DE-de"
          }
        ],
        "responses": {
          "200": {
            "description": "Data returned",
            "schema": {
              "$ref": "#/definitions/BookingData"
            }
          },
          "404": {
            "$ref": "#/responses/BookingNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          },
          "429": {
            "description": "Too Many Requests"
          }
        }
      }
    },
    "/bookingByToken/{secureToken}/{lngBCP47}": {
      "get": {
        "tags": [
          "Webcheckin"
        ],
        "summary": "Request booking data with booking security token",
        "description": "",
        "operationId": "getBookingByToken",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "secureToken",
            "in": "path",
            "description": "Security token generated with booking information and the Email address, this token is going to change by any change of the booking data.",
            "required": true,
            "type": "string"
          },
          {
            "name": "lngBCP47",
            "in": "path",
            "description": "BCP-47 Language string for hotel information, checkin pass",
            "required": true,
            "type": "string",
            "default": "DE-de"
          }
        ],
        "responses": {
          "200": {
            "description": "Data Returned",
            "schema": {
              "$ref": "#/definitions/BookingData"
            }
          },
          "404": {
            "$ref": "#/responses/BookingNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          }
        }
      }
    },
    "/booking/{secureToken}/preCheckin": {
      "put": {
        "tags": [
          "Webcheckin"
        ],
        "summary": "Execute precheck-in for the guest.",
        "description": "Update booking in database to the precheck-in status.",
        "operationId": "triggerPreCheckin",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "secureToken",
            "in": "path",
            "description": "Booking secure token matching with the backend secure token.",
            "required": true,
            "type": "string"
          },
          {
            "in": "body",
            "name": "body",
            "description": "Request server to set precheck-in status for a booking.",
            "required": true,
            "schema": {
              "$ref": "#/definitions/PreCheckinData"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Data Returned",
            "schema": {
              "$ref": "#/definitions/SecureToken"
            }
          },
          "401": {
            "$ref": "#/responses/UnauthorizedError"
          },
          "404": {
            "$ref": "#/responses/BookingNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          },
          "500": {
            "$ref": "#/responses/InternalServerError"
          }
        }
      }
    },
    "/booking/{secureToken}/changeEmail": {
      "post": {
        "tags": [
          "Webcheckin"
        ],
        "summary": "Change email only after preCheckin call. New opt-in mail will be send. This should only be possible, when a opt-in token is existing",
        "description": "Confirmation mail is not received (Opt-In eMail)",
        "operationId": "changeEmail",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "secureToken",
            "in": "path",
            "description": "booking secure token to update the email",
            "required": true,
            "type": "string"
          },
          {
            "in": "body",
            "name": "body",
            "description": "New Email to send opt-in mail to.",
            "required": true,
            "schema": {
              "$ref": "#/definitions/EmailData"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Data Returned",
            "schema": {
              "$ref": "#/definitions/SecureToken"
            }
          },
          "401": {
            "$ref": "#/responses/UnauthorizedError"
          },
          "404": {
            "$ref": "#/responses/BookingNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          }
        }
      }
    },
    "/booking/{secureToken}/addPaymentMethod": {
      "put": {
        "tags": [
          "Webcheckin"
        ],
        "summary": "Add one or two new payment method to the booking",
        "description": "Add a paymentMethod to the user or registration form. If the booking has a user it will add the PaymentMethod to the user. Otherwise the payment method will be linked to the registration form. <br /> This call will return all available payment methods for this booking (guest or registration form)",
        "operationId": "addPaymentMethod",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "secureToken",
            "in": "path",
            "description": "Booking secure token matching with the backend secure token.",
            "required": true,
            "type": "string"
          },
          {
            "in": "body",
            "name": "body",
            "description": "New payment method to add to the registration form",
            "required": true,
            "schema": {
              "$ref": "#/definitions/PaymentMethod"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Data Returned",
            "schema": {
              "$ref": "#/definitions/AvailablePaymentMethods"
            }
          },
          "401": {
            "$ref": "#/responses/UnauthorizedError"
          },
          "404": {
            "$ref": "#/responses/BookingNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          },
          "500": {
            "$ref": "#/responses/InternalServerError"
          }
        }
      }
    },
    "/booking/{secureToken}/pay": {
      "put": {
        "tags": [
          "Webcheckin"
        ],
        "summary": "Trigger pay and optional do the checkout for a booking.",
        "description": "Trigger the pay process and optional trigger the checkout, if now is after departure time",
        "operationId": "triggerPay",
        "consumes": [
          "application/json"
        ],
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "secureToken",
            "in": "path",
            "description": "Booking secure token matching with the backend secure token.",
            "required": true,
            "type": "string"
          },
          {
            "in": "body",
            "name": "body",
            "description": "Selected payment methods for the pay process and request an auto checkout",
            "required": true,
            "schema": {
              "$ref": "#/definitions/PayData"
            }
          }
        ],
        "responses": {
          "200": {
            "description": "Data Returned",
            "schema": {
              "$ref": "#/definitions/PayResponse"
            }
          },
          "401": {
            "$ref": "#/responses/UnauthorizedError"
          },
          "404": {
            "description": "Booking Not Found | Payment Method Not Found"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          },
          "500": {
            "$ref": "#/responses/InternalServerError"
          }
        }
      }
    },
    "/booking/{secureToken}/checkout": {
      "put": {
        "tags": [
          "Webcheckin"
        ],
        "summary": "Trigger the checkout for a booking.",
        "description": "Trigger the checkout process",
        "operationId": "triggerCheckout",
        "consumes": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "secureToken",
            "in": "path",
            "description": "Booking secure token matching with the backend secure token.",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "204": {
            "$ref": "#/responses/SuccessfulOperation"
          },
          "401": {
            "$ref": "#/responses/UnauthorizedError"
          },
          "404": {
            "$ref": "#/responses/BookingNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          },
          "500": {
            "$ref": "#/responses/InternalServerError"
          }
        }
      }
    },
    "/passData/{optInToken}/{lngBCP47}": {
      "get": {
        "tags": [
          "Webcheckin"
        ],
        "summary": "Confirm opt-in email and get data for checkin-pass.",
        "description": "Confirm the opt-in email is accepted by the end user and request due Checkin pass to use the Kiosk in the hotel.",
        "operationId": "getPassData",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "optInToken",
            "in": "path",
            "description": "single use token to get back the current preckechin",
            "required": true,
            "type": "string"
          },
          {
            "name": "lngBCP47",
            "in": "path",
            "description": "BCP-47 Language string for hotel information, checkin pass, ...",
            "required": true,
            "type": "string",
            "default": "DE-de"
          }
        ],
        "responses": {
          "200": {
            "description": "Data Returned",
            "schema": {
              "$ref": "#/definitions/CheckinPass"
            }
          },
          "401": {
            "$ref": "#/responses/UnauthorizedError"
          },
          "404": {
            "$ref": "#/responses/TokenNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          }
        }
      }
    },
    "/itWasNotMe/{secureToken}/{lngBCP47}/companyData": {
      "get": {
        "tags": [
          "Webcheckin"
        ],
        "summary": "Get company data for the hotel style visualization of the thank-you screen",
        "description": "No server Business logic. Just returning layout data",
        "operationId": "getItWasNotMeCompanyData",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "secureToken",
            "in": "path",
            "description": "Security token generated with booking information and the Email address, this token will changed by any change of the booking data.",
            "required": true,
            "type": "string"
          },
          {
            "name": "lngBCP47",
            "in": "path",
            "description": "BCP-47 Language string for hotel information, ...",
            "required": true,
            "type": "string",
            "default": "DE-de"
          }
        ],
        "responses": {
          "200": {
            "description": "Data Returned",
            "schema": {
              "$ref": "#/definitions/itWasNotMeData"
            }
          },
          "401": {
            "$ref": "#/responses/UnauthorizedError"
          },
          "404": {
            "$ref": "#/responses/TokenNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          }
        }
      }
    },
    "/itWasNotMe/{optInToken}/confirm": {
      "post": {
        "tags": [
          "Webcheckin"
        ],
        "summary": "Confirm that the eMail receiver did not do the Web-Check-In.",
        "description": "Delete all data from the Web-Check-In. RegistrationForm ",
        "operationId": "itWasNotMeConfirm",
        "parameters": [
          {
            "name": "optInToken",
            "in": "path",
            "description": "Token to invalidate it and secure this call as single use.",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "204": {
            "$ref": "#/responses/SuccessfulOperation"
          },
          "401": {
            "$ref": "#/responses/UnauthorizedError"
          },
          "404": {
            "$ref": "#/responses/TokenNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          }
        }
      }
    },
    "/createAccount/{secureToken}/{lngBCP47}": {
      "post": {
        "tags": [
          "Webcheckin"
        ],
        "summary": "Convert a Webcheckin user to a real hotelbird user",
        "description": "No activation mail will be send.",
        "operationId": "createAccount",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "secureToken",
            "in": "path",
            "description": "Booking secure token to create a new account",
            "required": true,
            "type": "string"
          },
          {
            "name": "lngBCP47",
            "in": "path",
            "description": "Separate frontend integration from backend integration. New lngs on one side are not required on the other side (list sorted by Name/ABC)",
            "required": true,
            "type": "string",
            "default": "DE-de"
          },
          {
            "in": "body",
            "name": "body",
            "description": "Password data to be added to the hb_user.",
            "required": true,
            "schema": {
              "$ref": "#/definitions/PasswordData"
            }
          }
        ],
        "responses": {
          "204": {
            "$ref": "#/responses/SuccessfulOperation"
          },
          "401": {
            "$ref": "#/responses/UnauthorizedError"
          },
          "404": {
            "description": "Booking Not Found | Registration Form Not Found"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          }
        }
      }
    },
    "/organisation/{webToken}": {
      "get": {
        "tags": [
          "Kiosk"
        ],
        "summary": "Requests organisation data and available options. Return the data in the organisation language.",
        "operationId": "getOrganisation",
        "parameters": [
          {
            "name": "webToken",
            "in": "path",
            "description": "Generated web_token to identify the organisation. It is fixed and will not change in any cases",
            "required": true,
            "type": "string"
          }
        ],
        "responses": {
          "200": {
            "description": "Data returned",
            "schema": {
              "$ref": "#/definitions/OrganisationProperties"
            }
          },
          "403": {
            "$ref": "#/responses/ForbiddenService"
          },
          "404": {
            "$ref": "#/responses/OrganisationNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          }
        }
      }
    },
    "/bookingKioskData/{secureToken}": {
      "get": {
        "tags": [
          "Kiosk"
        ],
        "summary": "Request precheckin data with check-in pass token.",
        "description": "",
        "operationId": "getBookingKioskData",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "secureToken",
            "in": "path",
            "description": "Booking secure_token received by mail or app.",
            "required": true,
            "type": "string"
          },
          {
            "name": "webToken",
            "in": "header",
            "description": "Token to bind request to organisation.",
            "type": "string",
            "required": true
          }
        ],
        "responses": {
          "200": {
            "description": "Data Returned",
            "schema": {
              "$ref": "#/definitions/KioskData"
            }
          },
          "403": {
            "$ref": "#/responses/ForbiddenService"
          },
          "404": {
            "$ref": "#/responses/TokenNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          }
        }
      }
    },
    "/booking/{secureToken}/signature": {
      "put": {
        "tags": [
          "Kiosk"
        ],
        "summary": "Add a guest signature to an existing booking.",
        "description": "Only possible for a prechecked in bookings.",
        "operationId": "setSignature",
        "parameters": [
          {
            "name": "secureToken",
            "in": "path",
            "description": "Booking secure token matching with the backend booking.",
            "required": true,
            "type": "string"
          },
          {
            "name": "webToken",
            "in": "header",
            "description": "Token to bind request to organisation.",
            "type": "string",
            "required": true
          },
          {
            "in": "body",
            "name": "body",
            "description": "Signature data to be added to a registration form.",
            "required": true,
            "schema": {
              "$ref": "#/definitions/SignatureData"
            }
          }
        ],
        "responses": {
          "204": {
            "$ref": "#/responses/SuccessfulOperation"
          },
          "401": {
            "$ref": "#/responses/UnauthorizedError"
          },
          "403": {
            "$ref": "#/responses/ForbiddenService"
          },
          "404": {
            "$ref": "#/responses/BookingNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          }
        }
      }
    },
    "/booking/{secureToken}/extCheckin": {
      "put": {
        "tags": [
          "Kiosk"
        ],
        "summary": "Trigger checkin task in the backend.",
        "description": "Only possible for bookings which are completely prechecked in and signed. Used to create key as next step.",
        "operationId": "extCheckin",
        "parameters": [
          {
            "name": "secureToken",
            "in": "path",
            "description": "booking secure Token matching with the backend booking",
            "required": true,
            "type": "string"
          },
          {
            "name": "webToken",
            "in": "header",
            "description": "token to bind request to organisation",
            "type": "string",
            "required": true
          }
        ],
        "responses": {
          "204": {
            "$ref": "#/responses/SuccessfulOperation"
          },
          "401": {
            "$ref": "#/responses/UnauthorizedError"
          },
          "403": {
            "$ref": "#/responses/ForbiddenService"
          },
          "404": {
            "$ref": "#/responses/BookingNotFound"
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          },
          "423": {
            "$ref": "#/responses/CheckinLocked"
          }
        }
      }
    },
    "/booking/{secureToken}/generateKey": {
      "post": {
        "tags": [
          "Kiosk"
        ],
        "summary": "Request booking data with user information",
        "description": "",
        "operationId": "generateKey",
        "produces": [
          "application/json"
        ],
        "parameters": [
          {
            "name": "secureToken",
            "in": "path",
            "description": "booking secureToken matching with the backend booking",
            "required": true,
            "type": "string"
          },
          {
            "name": "webToken",
            "in": "header",
            "description": "token to bind request to organisation",
            "type": "string",
            "required": true
          }
        ],
        "responses": {
          "200": {
            "description": "Data Returned",
            "schema": {
              "$ref": "#/definitions/Room"
            }
          },
          "401": {
            "$ref": "#/responses/UnauthorizedError"
          },
          "403": {
            "$ref": "#/responses/ForbiddenService"
          },
          "404": {
            "description": "Booking Not Found<br/>Resource Not Found",
            "schema": {
              "type": "string",
              "description": "Error message what is not found"
            }
          },
          "405": {
            "$ref": "#/responses/InvalidParameter"
          }
        }
      }
    }
  },
  "definitions": {
    "SearchData": {
      "type": "object",
      "required": [
        "organisationList"
      ],
      "properties": {
        "reCaptcha": {
          "type": "string",
          "description": "reCaptcha site-data to show reCaptcha protection. Is no value given, do not show reCaptcha",
          "example": "reCaptcha Token"
        },
        "organisationList": {
          "type": "array",
          "items": {
            "type": "object",
            "required": [
              "id",
              "name",
              "primaryColor"
            ],
            "properties": {
              "id": {
                "type": "integer",
                "format": "int32",
                "description": "Id to use to reference to this organisation",
                "example": 1
              },
              "name": {
                "type": "string",
                "description": "Name to display",
                "example": "Hotel name"
              },
              "primaryColor": {
                "type": "string",
                "description": "Primary color tag for this organisation. (000000 - ffffff)",
                "example": "dd0000"
              }
            }
          }
        }
      }
    },
    "BookingData": {
      "type": "object",
      "required": [
        "secureToken",
        "reservationId",
        "foregroundColor",
        "backgroundColor",
        "wlaData",
        "startDate",
        "endDate",
        "checkinTime",
        "hotel"
      ],
      "properties": {
        "secureToken": {
          "type": "string",
          "description": "Booking secure token as reference for further requests",
          "example": "SecureToken"
        },
        "reservationId": {
          "type": "string",
          "description": "Reservation Id as reference for the guest",
          "example": "R-123-asdf-23"
        },
        "foregroundColor": {
          "type": "string",
          "description": "font color for text specified in the organisation settings (000000 - ffffff)",
          "example": "ccffcc"
        },
        "backgroundColor": {
          "type": "string",
          "description": "background color for highlighted blocks specified in the organisation settings (000000 - ffffff)",
          "example": "220022"
        },
        "wlaData": {
          "$ref": "#/definitions/WlaData"
        },
        "startDate": {
          "type": "integer",
          "format": "int64",
          "description": "Unix local timestamp when the booking starts",
          "example": 1525863963
        },
        "endDate": {
          "type": "integer",
          "format": "int64",
          "description": "Unix local timestamp when the booking ends",
          "example": 1525863963
        },
        "checkinTime": {
          "type": "integer",
          "format": "int64",
          "description": "Unix local timestamp guest can checkin into the room",
          "example": 1525863963
        },
        "hotel": {
          "$ref": "#/definitions/Hotel"
        },
        "guest": {
          "$ref": "#/definitions/Guest"
        },
        "company": {
          "$ref": "#/definitions/Company"
        },
        "summary": {
          "$ref": "#/definitions/SummaryData"
        }
      }
    },
    "PreCheckinData": {
      "type": "object",
      "required": [
        "guest"
      ],
      "properties": {
        "paymentMethod": {
          "$ref": "#/definitions/PaymentMethod"
        },
        "guest": {
          "$ref": "#/definitions/Guest"
        },
        "company": {
          "$ref": "#/definitions/Company"
        }
      }
    },
    "Hotel": {
      "type": "object",
      "required": [
        "image",
        "name",
        "street",
        "zip",
        "city",
        "country",
        "countryCode",
        "phone",
        "formLegalInstructions",
        "paymentReq",
        "allowInvoiceSplit",
        "allowCreateAccount",
        "requestPassport",
        "allowMobilePayment",
        "allowMobileCheckout"
      ],
      "properties": {
        "image": {
          "type": "string",
          "description": "base 64 string. (size: 300 x *)",
          "example": "base64Imagedata"
        },
        "name": {
          "type": "string",
          "description": "Name of the hotel",
          "example": "Hotel Name"
        },
        "street": {
          "type": "string",
          "description": "Address of the Hotel",
          "example": "Hotelstr. 123"
        },
        "zip": {
          "type": "string",
          "description": "Address of the Hotel",
          "example": "C-1234"
        },
        "city": {
          "type": "string",
          "description": "Address of the Hotel",
          "example": "City"
        },
        "country": {
          "type": "string",
          "description": "Address of the Hotel",
          "example": "Deutschland"
        },
        "countryCode": {
          "type": "string",
          "description": "country code of the Hotel (ISO 2 Letters)",
          "example": "DE"
        },
        "phone": {
          "type": "string",
          "description": "Telephone contact of the Hotel",
          "example": "+49 89 123456"
        },
        "formLegalInstructions": {
          "type": "string",
          "description": "Additional terms to accept for using this hotel",
          "example": "Ware closes"
        },
        "paymentReq": {
          "type": "integer",
          "format": "int32",
          "enum": [
            0,
            1,
            2,
            3
          ],
          "description": "required payment method for this hotel: * 0 - no payment. * 1 - as security * 2 - pre auth * 3 - prepayment",
          "example": 1
        },
        "allowInvoiceSplit": {
          "type": "boolean",
          "description": "do not ask user for company data when hotel is not supporting it",
          "example": true
        },
        "allowCreateAccount": {
          "type": "boolean",
          "description": "show or hide button to create new Account on check-in Pass",
          "example": true
        },
        "requestPassport": {
          "type": "integer",
          "format": "int32",
          "enum": [
            0,
            1,
            2
          ],
          "description": "passport is required from the hotel: * 0 - not required. * 1 - always * 2 - from foreigners",
          "example": 1
        },
        "allowMobilePayment": {
          "type": "boolean",
          "description": "Hotel allow mobile Payment",
          "example": true
        },
        "allowMobileCheckout": {
          "type": "boolean",
          "description": "Hotel allow mobile Checkout",
          "example": true
        }
      }
    },
    "Guest": {
      "type": "object",
      "required": [
        "firstName",
        "lastName",
        "gender",
        "nationality",
        "birthday",
        "email",
        "street",
        "zip",
        "city",
        "country",
        "businessInvoice"
      ],
      "properties": {
        "firstName": {
          "type": "string",
          "description": "First name of guest",
          "example": "Max"
        },
        "lastName": {
          "type": "string",
          "description": "Last name of guest",
          "example": "Mustermann"
        },
        "gender": {
          "type": "string",
          "enum": [
            "M",
            "F"
          ],
          "description": "Guests gender: M|Male F|Female ",
          "example": "M"
        },
        "nationality": {
          "type": "string",
          "description": "Nationality from the guest (ISO 2 Letters)",
          "example": "DE"
        },
        "birthday": {
          "type": "string",
          "description": "Guests day of birth (yyyy-mm-dd)",
          "example": "2000-01-01"
        },
        "email": {
          "type": "string",
          "description": "Guests E-mail address",
          "example": "max.mustemann@example.de"
        },
        "street": {
          "type": "string",
          "description": "street where the guest lifes",
          "example": "Muster Straße 1"
        },
        "zip": {
          "type": "string",
          "description": "ZIP of the area where the guest lifes",
          "example": "C-12345"
        },
        "city": {
          "type": "string",
          "description": "City where the guest lifes",
          "example": "Musterstadt"
        },
        "country": {
          "type": "string",
          "description": "Country where the guest lifes (ISO 2 Letters)",
          "example": "DE"
        },
        "businessInvoice": {
          "type": "boolean",
          "description": "Guest request a invoice splitting",
          "example": true
        },
        "passport": {
          "$ref": "#/definitions/Passport"
        }
      }
    },
    "Passport": {
      "type": "object",
      "required": [
        "passtype",
        "number",
        "expDate",
        "authority"
      ],
      "properties": {
        "passtype": {
          "type": "string",
          "enum": [
            "P",
            "I"
          ],
          "description": "Passport type: P|Passport // I|National Identity (EEA)",
          "example": "P"
        },
        "number": {
          "type": "string",
          "description": "unique Document number",
          "example": "gfrewadsfghtrze"
        },
        "expDate": {
          "type": "string",
          "description": "Date of expiry (yyyy-mm-dd)",
          "example": "2099-01-01"
        },
        "authority": {
          "type": "string",
          "description": "Issuing Authority",
          "example": "Musterstadt"
        }
      }
    },
    "Company": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string",
          "description": "Company name for business invoice",
          "example": "Hotelbird"
        },
        "street": {
          "type": "string",
          "description": "Address of the company",
          "example": "Schillerstraße 1"
        },
        "zip": {
          "type": "string",
          "description": "Address of the company",
          "example": "D-1234"
        },
        "city": {
          "type": "string",
          "description": "Address of the company",
          "example": "München"
        },
        "country": {
          "type": "string",
          "description": "Address of the company (ISO 2 Letters)",
          "example": "Deutschland"
        },
        "financeDep": {
          "type": "string",
          "description": "finance Departure for additional information on the invoice",
          "example": "80021"
        },
        "paysRoom": {
          "type": "boolean",
          "description": "Company pays the amount of the Room",
          "example": true
        },
        "paysBreakfast": {
          "type": "boolean",
          "description": "Company pays the amount of the Breakfast",
          "example": true
        },
        "paysParking": {
          "type": "boolean",
          "description": "Company pays the amount of the Parking place",
          "example": true
        },
        "paysWifi": {
          "type": "boolean",
          "description": "Company pays the amount of the WiFi",
          "example": true
        },
        "paysRestaurant": {
          "type": "boolean",
          "description": "Company pays the amount of the Restaurant",
          "example": false
        },
        "paysBar": {
          "type": "boolean",
          "description": "Company pays the amount of the Bar",
          "example": false
        },
        "paysMinibar": {
          "type": "boolean",
          "description": "Company pays the amount of the Minibar",
          "example": false
        },
        "paysOther": {
          "type": "boolean",
          "description": "Company pays the amount of other services",
          "example": false
        }
      }
    },
    "SummaryData": {
      "type": "object",
      "required": [
        "qrCode",
        "downloadPass"
      ],
      "properties": {
        "qrCode": {
          "type": "string",
          "description": "png base64 (minimized 1Pixel per grid-point)",
          "example": "base64 image data"
        },
        "downloadPass": {
          "type": "string",
          "description": "url to download passport",
          "example": "http://api.hotelbird.de/link"
        },
        "passNoteTitle": {
          "type": "string",
          "description": "Title for the Checkin-Pass.",
          "example": "Welcome on board"
        },
        "passNote": {
          "type": "string",
          "description": "Information text for the Checkin-Pass.",
          "example": "Please bring your dog with you"
        },
        "folio": {
          "description": "Optional. Only there when the guest is in the hotel, and the hotel allows at least one part of the checkout process. (checkin_ext & now after checkinTime & (allowMobilePayment | allowMobileCheckout))",
          "$ref": "#/definitions/Folio"
        }
      }
    },
    "SecureToken": {
      "type": "object",
      "required": [
        "secureToken"
      ],
      "properties": {
        "secureToken": {
          "type": "string",
          "description": "New secure token to reference next calls to the booking",
          "example": "secure token data"
        }
      }
    },
    "EmailData": {
      "type": "object",
      "required": [
        "email"
      ],
      "properties": {
        "email": {
          "type": "string",
          "description": "New email for user. A neu opt-in mail will be send to this address.",
          "example": "max.musterman@example.de"
        }
      }
    },
    "PayData": {
      "type": "object",
      "description": "Payment Data<br> Data to trigger the pay process. Assign the payment method to private and business invoice.  Is the amount 0.00, the guest can skip the assign a payment method.  For non-split invoices, data will be sent in privatePaymentMethod",
      "required": [
        "privatePaymentMethod",
        "triggerCheckout"
      ],
      "properties": {
        "privatePaymentMethod": {
          "type": "number",
          "format": "int64",
          "description": "Id of payment method to use for the private folio (or non split)(0 = not assigned when amount = 0)",
          "example": 1
        },
        "businessPaymentMethod": {
          "type": "number",
          "format": "int64",
          "description": "Id of payment method to use for the business folio (0 = not assigned when no splitting or amount = 0)",
          "example": 2
        },
        "triggerCheckout": {
          "type": "boolean",
          "description": "direct trigger the checkout after successfully pay",
          "example": false
        }
      }
    },
    "PayResponse": {
      "type": "object",
      "description": "The response of the completed payment process. Returns a resolved folio with no open amount and the flag whether the checkout is compleat or not.",
      "required": [
        "checkoutDone",
        "folio"
      ],
      "properties": {
        "checkoutDone": {
          "type": "boolean",
          "description": "Checkout was automatically triggered on the Server",
          "example": true
        },
        "folio": {
          "$ref": "#/definitions/Folio"
        }
      }
    },
    "CheckinPass": {
      "type": "object",
      "required": [
        "qrCode",
        "passDownloadLink",
        "secureToken",
        "foregroundColor",
        "backgroundColor",
        "wlaData",
        "hotel"
      ],
      "properties": {
        "qrCode": {
          "type": "string",
          "description": "PNG base64 (minimised 1Pixel per grid-point)",
          "example": "base64 image data"
        },
        "passDownloadLink": {
          "type": "string",
          "description": "External link to download the PDF-kiosk pass",
          "example": "http://api.hotelbird.de/link"
        },
        "secureToken": {
          "type": "string",
          "description": "Booking secure token as reference to create a hotelbird account",
          "example": "secure token data"
        },
        "foregroundColor": {
          "type": "string",
          "description": "font color for text specified in the organisation settings (000000 - ffffff)",
          "example": "000000"
        },
        "backgroundColor": {
          "type": "string",
          "description": "background color for highlighted blocks specified in the organisation settings (000000 - ffffff)",
          "example": "ffffff"
        },
        "wlaData": {
          "$ref": "#/definitions/WlaData"
        },
        "hotel": {
          "$ref": "#/definitions/Hotel"
        },
        "passNoteTitle": {
          "type": "string",
          "description": "Title for the Checkin-Pass.",
          "example": "Welcome on board"
        },
        "passNote": {
          "type": "string",
          "description": "Information text for the Checkin-Pass.",
          "example": "Please bring your dog with you"
        }
      }
    },
    "itWasNotMeData": {
      "type": "object",
      "required": [
        "name",
        "image",
        "foregroundColor",
        "backgroundColor",
        "wlaData"
      ],
      "properties": {
        "name": {
          "type": "string",
          "description": "name of the Hotel",
          "example": "Test Hotel"
        },
        "image": {
          "type": "string",
          "description": "logo to brand the landing page (base64 string)",
          "example": "base64 image data"
        },
        "foregroundColor": {
          "type": "string",
          "description": "font color for text specified in the organisation settings (000000 - ffffff)",
          "example": "000000"
        },
        "backgroundColor": {
          "type": "string",
          "description": "background color for highlighted blocks specified in the organisation settings (000000 - ffffff)",
          "example": "ffffff"
        },
        "wlaData": {
          "$ref": "#/definitions/WlaData"
        }
      }
    },
    "PasswordData": {
      "type": "object",
      "required": [
        "password"
      ],
      "properties": {
        "password": {
          "type": "string",
          "description": "new password for user. This will be used to log on in the hotelbird app",
          "example": "superpassword_!123$"
        }
      }
    },
    "WlaData": {
      "type": "object",
      "required": [
        "name",
        "iPhoneApp",
        "androidApp",
        "foregroundColor",
        "backgroundColor",
        "buttonColor"
      ],
      "properties": {
        "name": {
          "type": "string",
          "description": "Name of the app in the store.",
          "example": "Hotelbird"
        },
        "iPhoneApp": {
          "type": "string",
          "description": "Link to the white label app in the AppStore.",
          "example": "http://applestore.de/hotelbird"
        },
        "androidApp": {
          "type": "string",
          "description": "Link to the white label app in the GooglePlayStore.",
          "example": "http://playstore.de/hotelbird"
        },
        "foregroundColor": {
          "type": "string",
          "description": "font color for text specified in the WLA settings (000000 - ffffff)",
          "example": "222222"
        },
        "backgroundColor": {
          "type": "string",
          "description": "background color for highlighted blocks specified in the WLA settings (000000 - ffffff)",
          "example": "ffffff"
        },
        "buttonColor": {
          "type": "string",
          "description": "button color for all positive actions specified in the WLA settings (000000 - ffffff)",
          "example": "007bff"
        }
      }
    },
    "PaymentMethod": {
      "type": "array",
      "minItems": 1,
      "maxItems": 2,
      "uniqueItems": true,
      "description": "For multiple credit cards like: 1 private / 1 business.",
      "items": {
        "type": "object",
        "required": [
          "creditCardToken",
          "cardType",
          "cardOwner",
          "expMonth",
          "expYear"
        ],
        "properties": {
          "creditCardToken": {
            "type": "string",
            "description": "Token from credit card iFrame",
            "example": "test_23814tgf7sa83"
          },
          "cardType": {
            "type": "string",
            "description": "p = private / b = business",
            "example": "p"
          },
          "cardOwner": {
            "type": "string",
            "description": "Compleat name of credit card owner",
            "example": "Max Mustermann"
          },
          "expMonth": {
            "type": "integer",
            "format": "int32",
            "minimum": 1,
            "maximum": 12,
            "description": "Credit card expiring month",
            "example": 12
          },
          "expYear": {
            "type": "integer",
            "format": "int32",
            "minimum": 2018,
            "maximum": 2999,
            "description": "Credit card expiring year",
            "example": 2999
          }
        }
      }
    },
    "AvailablePaymentMethods": {
      "type": "array",
      "uniqueItems": true,
      "description": "All payment methods registered to a guest",
      "items": {
        "type": "object",
        "required": [
          "id",
          "brand",
          "type",
          "lastDigits",
          "cardHolder"
        ],
        "properties": {
          "id": {
            "type": "number",
            "format": "int64",
            "description": "ID to reference to it",
            "example": "1"
          },
          "brand": {
            "type": "string",
            "description": "Brand for the frontend to show it to the user",
            "example": "VISA"
          },
          "type": {
            "type": "string",
            "description": "Business or private payment method",
            "example": "p"
          },
          "lastDigits": {
            "type": "string",
            "description": "last 4 digits for help the user to select his card",
            "example": "4242"
          },
          "cardHolder": {
            "type": "string",
            "description": "Name of the card holder",
            "example": "Max Mustermann"
          }
        }
      }
    },
    "Folio": {
      "type": "object",
      "description": "Information about the stuff to pay for the guest. invoiceSplit defines if the guest like to split into a business and private invoice.",
      "required": [
        "businessInvoice",
        "privateAmount",
        "businessAmount",
        "totalAmount",
        "currency",
        "posts",
        "paymentMethods",
        "addresses"
      ],
      "properties": {
        "businessInvoice": {
          "type": "boolean",
          "description": "User request an invoice split. If false: Everything is in private",
          "example": true
        },
        "privateAmount": {
          "type": "number",
          "format": "int32",
          "description": "Open amount for the private account",
          "example": 3200
        },
        "businessAmount": {
          "type": "number",
          "format": "int32",
          "description": "Open amount for the business account",
          "example": 26800
        },
        "totalAmount": {
          "type": "number",
          "format": "int32",
          "description": "total Open amount",
          "example": 30000
        },
        "currency": {
          "type": "string",
          "description": "Currency used for the total amounts.",
          "example": "EUR"
        },
        "posts": {
          "type": "array",
          "description": "all posts for this booking",
          "items": {
            "$ref": "#/definitions/FolioPost"
          }
        },
        "paymentMethods": {
          "$ref": "#/definitions/AvailablePaymentMethods"
        },
        "addresses": {
          "type": "array",
          "description": "Guest invoice address, assigned with P and B",
          "minItems": 1,
          "maxItems": 2,
          "uniqueItems": true,
          "items": {
            "$ref": "#/definitions/InvoiceAddress"
          }
        }
      }
    },
    "FolioPost": {
      "type": "object",
      "description": "Describe one open post in any folio. Will be assigned by B or P in the folio property",
      "required": [
        "title",
        "amount",
        "currency",
        "folio",
        "dateTime"
      ],
      "properties": {
        "title": {
          "type": "string",
          "description": "Text to show in bill or on screen (not translatable from PMS)",
          "example": "Übernachtung"
        },
        "amount": {
          "type": "number",
          "format": "int32",
          "description": "amount of this post in the folio (cent)(neg. numbers are good for the guest)",
          "example": 8500
        },
        "currency": {
          "type": "string",
          "description": "currency of this post",
          "example": "EUR"
        },
        "folio": {
          "type": "string",
          "description": "P = private / B = business",
          "example": "P"
        },
        "dateTime": {
          "type": "number",
          "format": "int64",
          "description": "unix timestamp when the post is add to the booking",
          "example": 1525219200
        }
      }
    },
    "InvoiceAddress": {
      "type": "object",
      "description": "Invoice address, optional with a company name",
      "required": [
        "firstName",
        "lastName",
        "street",
        "zip",
        "city",
        "country",
        "folio"
      ],
      "properties": {
        "firstName": {
          "type": "string",
          "description": "guest first name",
          "example": "Max"
        },
        "lastName": {
          "type": "string",
          "description": "guest last name",
          "example": "Mustermann"
        },
        "company": {
          "type": "string",
          "description": "optional company name for a businessInvoice",
          "example": "Muster AG"
        },
        "street": {
          "type": "string",
          "description": "Street for the address",
          "example": "Musterstraße 12"
        },
        "zip": {
          "type": "string",
          "description": "zip of the address e.g.: C-1452, 82444",
          "example": "12345"
        },
        "city": {
          "type": "string",
          "description": "City for the address",
          "example": "München"
        },
        "country": {
          "type": "string",
          "description": "Country for the address",
          "example": "Deutschland"
        },
        "folio": {
          "type": "string",
          "description": "assign to a folio P = private / B = business",
          "example": "P"
        }
      }
    },
    "OrganisationProperties": {
      "type": "object",
      "required": [
        "name",
        "city",
        "logo",
        "languageId"
      ],
      "properties": {
        "name": {
          "type": "string",
          "description": "Hotel name to display on the welcome screen",
          "example": "Hotel name"
        },
        "city": {
          "type": "string",
          "description": "City of hotel to display on the welcome screen",
          "example": "Musterstadt"
        },
        "logo": {
          "type": "string",
          "description": "base64 string",
          "example": "base64 image data"
        },
        "languageId": {
          "type": "integer",
          "format": "int32",
          "description": "default language id",
          "example": 1
        },
        "backgroundColor": {
          "type": "string",
          "description": "Background color of the webpage/kiosk-app",
          "default": "ffffff",
          "example": "ffffff"
        },
        "foregroundColor": {
          "type": "string",
          "description": "Text color in the webpage/kiosk-app",
          "default": "000000",
          "example": "ffffff"
        },
        "primaryColor": {
          "type": "string",
          "description": "Color of dominant elements in webpage/kiosk-app e.g.: Next Button",
          "default": "3CA0D0",
          "example": "3CA0D0"
        }
      }
    },
    "KioskData": {
      "type": "object",
      "required": [
        "secureToken",
        "needSignature",
        "startDate",
        "endDate"
      ],
      "properties": {
        "secureToken": {
          "type": "string",
          "description": "Reference to the database to bind up coming requests",
          "example": "secure Token data"
        },
        "needSignature": {
          "type": "boolean",
          "description": "Request the user to give signature on the terminal",
          "example": true
        },
        "needCheckIn": {
          "type": "boolean",
          "description": "Tells the kiosk if the check-in is needed or can be skipped.",
          "example": true
        },
        "startDate": {
          "type": "integer",
          "format": "int64",
          "description": "Unix local timestamp",
          "example": 1523456789
        },
        "endDate": {
          "type": "integer",
          "format": "int64",
          "description": "Unix local timestamp",
          "example": 1523456789
        },
        "firstName": {
          "type": "string",
          "description": "First name of the guest",
          "example": "Max"
        },
        "lastName": {
          "type": "string",
          "description": "Last name of the guest",
          "example": "Mustermann"
        },
        "birthday": {
          "type": "string",
          "description": "Birthday of the guest (yyyy-mm-dd)",
          "example": "2000-01-01"
        },
        "street": {
          "type": "string",
          "description": "street where the guest lifes",
          "example": "Straße 1"
        },
        "zip": {
          "type": "string",
          "description": "ZIP of the area where the guest lifes",
          "example": "81234"
        },
        "city": {
          "type": "string",
          "description": "City where the guest lifes",
          "example": "Stadt"
        },
        "country": {
          "type": "string",
          "description": "Country where the guest lifes (ISO 2 Letters)",
          "example": "DE"
        }
      }
    },
    "SignatureData": {
      "type": "object",
      "required": [
        "timestamp",
        "signature"
      ],
      "properties": {
        "timestamp": {
          "type": "integer",
          "format": "int64",
          "description": "Current time on the local device",
          "example": 1523456789
        },
        "signature": {
          "type": "string",
          "description": "PNG as base64 data string",
          "example": "base64imagedata"
        }
      }
    },
    "Room": {
      "type": "object",
      "required": [
        "gender",
        "name",
        "room"
      ],
      "properties": {
        "gender": {
          "type": "string",
          "enum": [
            "M",
            "F"
          ],
          "description": "Guests gender: M|Male F|Female",
          "example": "M"
        },
        "name": {
          "type": "string",
          "description": "Last name of Guest",
          "example": "Max Mustermann"
        },
        "room": {
          "type": "string",
          "description": "Room number",
          "example": "101"
        }
      }
    }
  },
  "responses": {
    "SuccessfulOperation": {
      "description": "Successful Operation"
    },
    "UnauthorizedError": {
      "description": "Refused Access",
      "schema": {
        "type": "string",
        "description": "Error message by trying to request resource"
      }
    },
    "NoOrganizationFound": {
      "description": "No Organisation Found"
    },
    "OrganisationNotFound": {
      "description": "Organisation Not Found"
    },
    "BookingNotFound": {
      "description": "Booking Not Found"
    },
    "TokenNotFound": {
      "description": "Token Not Found"
    },
    "ForbiddenService": {
      "description": "Forbidden Service"
    },
    "InvalidParameter": {
      "description": "Invalid Parameter",
      "schema": {
        "type": "array",
        "description": "Error by validation of the parameter",
        "items": {
          "type": "string",
          "description": "description of error"
        }
      }
    },
    "CheckinLocked": {
      "description": "Checkin Not Possible",
      "schema": {
        "type": "string",
        "description": "Reason why check in failed"
      }
    },
    "InternalServerError": {
      "description": "Internal Server Error"
    }
  }
}`);
