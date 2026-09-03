import type { OrderLogGroup } from '../utils/transformOrderLog';

// Embedded order log data for full-screen mode compatibility
export const ORDER_LOG_DATA: OrderLogGroup[] = [
    {
        "groupId": "NC4100400228 -3 -0 ",
        "isGroup": false,
        "primaryEvent": {
            "id": "NC4100400228 -3 -0 ",
            "timestamp": "2026-01-19T07:27:28.000Z",
            "status": "remarks",
            "title": "Order Updated ",
            "version": 3,
            "user": "",
            "isExpandable": true,
            "notesType": "remarks",
            "tableData": [
                {
                    "fieldName": "Order Status",
                    "changedFrom": "In Progress",
                    "changedTo": "Completed",
                    "id": "17730546491390.7014412561981844"
                }
            ]
        },
        "events": [
            {
                "id": "NC4100400228 -3 -0 ",
                "timestamp": "2026-01-19T07:27:28.000Z",
                "status": "remarks",
                "title": "Order Updated ",
                "version": 3,
                "user": "",
                "isExpandable": true,
                "notesType": "remarks",
                "tableData": [
                    {
                        "fieldName": "Order Status",
                        "changedFrom": "In Progress",
                        "changedTo": "Completed",
                        "id": "17730546491390.7014412561981844"
                    }
                ]
            }
        ],
        "title": "Order Updated "
    },
    {
        "groupId": "NC4100400228 -3 -1 ",
        "isGroup": false,
        "primaryEvent": {
            "id": "NC4100400228 -3 -1 ",
            "timestamp": "2026-01-19T07:27:28.000Z",
            "status": "remarks",
            "title": "Order Complted ",
            "version": 3,
            "user": "",
            "isExpandable": false,
            "notesType": "remarks"
        },
        "events": [
            {
                "id": "NC4100400228 -3 -1 ",
                "timestamp": "2026-01-19T07:27:28.000Z",
                "status": "remarks",
                "title": "Order Complted ",
                "version": 3,
                "user": "",
                "isExpandable": false,
                "notesType": "remarks"
            }
        ],
        "title": "Order Complted "
    },
    {
        "groupId": "NC4100400228 -3 -2 -NC4100400228 -3 -4 -NC4100400228 -3 -5 ",
        "isGroup": true,
        "primaryEvent": {
            "id": "NC4100400228 -3 -2 ",
            "timestamp": "2026-01-19T07:27:27.000Z",
            "status": "remarks",
            "title": "Create Directory Listing - Task Completed ",
            "version": 3,
            "user": "",
            "isExpandable": false,
            "notesType": "remarks"
        },
        "events": [
            {
                "id": "NC4100400228 -3 -2 ",
                "timestamp": "2026-01-19T07:27:27.000Z",
                "status": "remarks",
                "title": "Create Directory Listing - Task Completed ",
                "version": 3,
                "user": "",
                "isExpandable": false,
                "notesType": "remarks"
            },
            {
                "id": "NC4100400228 -3 -4 ",
                "timestamp": "2026-01-19T07:27:24.000Z",
                "status": "remarks",
                "title": "Create Directory Listing - Task Created ",
                "version": 3,
                "user": "",
                "isExpandable": false,
                "notesType": "remarks"
            },
            {
                "id": "NC4100400228 -3 -5 ",
                "timestamp": "2026-01-19T07:27:24.000Z",
                "status": "remarks",
                "title": "Create Directory Listing - Task Updated ",
                "version": 3,
                "user": "",
                "isExpandable": true,
                "notesType": "remarks",
                "tableData": [
                    {
                        "fieldName": "Status",
                        "changedFrom": "",
                        "changedTo": "In Progress",
                        "id": "17730546491390.4896725052095834"
                    },
                    {
                        "fieldName": "Retried Count",
                        "changedFrom": "",
                        "changedTo": "0",
                        "id": "17730546491390.14634489069469736"
                    },
                    {
                        "fieldName": "Task Type",
                        "changedFrom": "",
                        "changedTo": "New",
                        "id": "17730546491390.5198068456954066"
                    }
                ]
            }
        ],
        "title": "Create Directory Listing"
    },
    {
        "groupId": "NC4100400228 -3 -8 ",
        "isGroup": false,
        "primaryEvent": {
            "id": "NC4100400228 -3 -8 ",
            "timestamp": "2026-01-19T07:27:07.000Z",
            "status": "userRemarks",
            "title": "BRIM Notification Received",
            "version": 3,
            "user": "",
            "isExpandable": false,
            "notesType": "userRemarks",
            "note": {
                "payload": {
                    "BAN": "7000511164",
                    "FailedCount": 0,
                    "FailedOrder": [],
                    "SuccessCount": 1,
                    "SuccessOrder": [
                        {
                            "Message": "Subscription Order 1102687897 created for Company Code E281 , BP 7000511164, Product ID 3369360058 , Product type EW-IL , Product Sub type PT",
                            "ProductSubType": "PT",
                            "ProductType": "EW-IL",
                            "Status": "Success",
                            "productID": "3369360058",
                            "subscriptionNumbers": "1102687897"
                        }
                    ],
                    "accountNumber": "7000511164",
                    "bossOrderId": "NC4100400228",
                    "jobId": "EW_20260119623508_12515900",
                    "success": "true"
                }
            }
        },
        "events": [
            {
                "id": "NC4100400228 -3 -8 ",
                "timestamp": "2026-01-19T07:27:07.000Z",
                "status": "userRemarks",
                "title": "BRIM Notification Received",
                "version": 3,
                "user": "",
                "isExpandable": false,
                "notesType": "userRemarks",
                "note": {
                    "payload": {
                        "BAN": "7000511164",
                        "FailedCount": 0,
                        "FailedOrder": [],
                        "SuccessCount": 1,
                        "SuccessOrder": [
                            {
                                "Message": "Subscription Order 1102687897 created for Company Code E281 , BP 7000511164, Product ID 3369360058 , Product type EW-IL , Product Sub type PT",
                                "ProductSubType": "PT",
                                "ProductType": "EW-IL",
                                "Status": "Success",
                                "productID": "3369360058",
                                "subscriptionNumbers": "1102687897"
                            }
                        ],
                        "accountNumber": "7000511164",
                        "bossOrderId": "NC4100400228",
                        "jobId": "EW_20260119623508_12515900",
                        "success": "true"
                    }
                }
            }
        ],
        "title": "BRIM Notification Received"
    },
    {
        "groupId": "NC4100400228 -3 -9 -NC4100400228 -3 -10 ",
        "isGroup": true,
        "primaryEvent": {
            "id": "NC4100400228 -3 -9 ",
            "timestamp": "2026-01-19T07:21:59.000Z",
            "status": "remarks",
            "title": "Enterprise Create Subscription Order - Task Updated ",
            "version": 3,
            "user": "",
            "isExpandable": true,
            "notesType": "remarks",
            "tableData": [
                {
                    "fieldName": "Status",
                    "changedFrom": "",
                    "changedTo": "In Progress",
                    "id": "17730546491390.4401393908928941"
                },
                {
                    "fieldName": "Retried Count",
                    "changedFrom": "",
                    "changedTo": "0",
                    "id": "17730546491390.45662766758142825"
                },
                {
                    "fieldName": "Task Type",
                    "changedFrom": "",
                    "changedTo": "New",
                    "id": "17730546491390.8104303829334969"
                }
            ]
        },
        "events": [
            {
                "id": "NC4100400228 -3 -9 ",
                "timestamp": "2026-01-19T07:21:59.000Z",
                "status": "remarks",
                "title": "Enterprise Create Subscription Order - Task Updated ",
                "version": 3,
                "user": "",
                "isExpandable": true,
                "notesType": "remarks",
                "tableData": [
                    {
                        "fieldName": "Status",
                        "changedFrom": "",
                        "changedTo": "In Progress",
                        "id": "17730546491390.4401393908928941"
                    },
                    {
                        "fieldName": "Retried Count",
                        "changedFrom": "",
                        "changedTo": "0",
                        "id": "17730546491390.45662766758142825"
                    },
                    {
                        "fieldName": "Task Type",
                        "changedFrom": "",
                        "changedTo": "New",
                        "id": "17730546491390.8104303829334969"
                    }
                ]
            },
            {
                "id": "NC4100400228 -3 -10 ",
                "timestamp": "2026-01-19T07:21:56.000Z",
                "status": "remarks",
                "title": "Enterprise Create Subscription Order - Task Created ",
                "version": 3,
                "user": "",
                "isExpandable": false,
                "notesType": "remarks",
                "note": "Enterprise Create Subscription Order - Task Created"
            }
        ],
        "title": "Enterprise Create Subscription Order"
    },
    {
        "groupId": "NC4100400228 -3 -12 ",
        "isGroup": false,
        "primaryEvent": {
            "id": "NC4100400228 -3 -12 ",
            "timestamp": "2026-01-19T07:21:56.000Z",
            "status": "remarks",
            "title": "Case CS11607857 Closed ",
            "version": 3,
            "user": "",
            "isExpandable": true,
            "notesType": "remarks",
            "tableData": [
                {
                    "fieldName": "Case Status",
                    "changedFrom": "Open",
                    "changedTo": "Closed",
                    "id": "17730546491390.5194467601395094"
                }
            ]
        },
        "events": [
            {
                "id": "NC4100400228 -3 -12 ",
                "timestamp": "2026-01-19T07:21:56.000Z",
                "status": "remarks",
                "title": "Case CS11607857 Closed ",
                "version": 3,
                "user": "",
                "isExpandable": true,
                "notesType": "remarks",
                "tableData": [
                    {
                        "fieldName": "Case Status",
                        "changedFrom": "Open",
                        "changedTo": "Closed",
                        "id": "17730546491390.5194467601395094"
                    }
                ]
            }
        ],
        "title": "Case CS11607857 Closed "
    },
    {
        "groupId": "NC4100400228 -3 -14 ",
        "isGroup": false,
        "primaryEvent": {
            "id": "NC4100400228 -3 -14 ",
            "timestamp": "2026-01-19T07:21:54.000Z",
            "status": "remarks",
            "title": "Order Updated ",
            "version": 3,
            "user": "",
            "isExpandable": true,
            "notesType": "remarks",
            "tableData": [
                {
                    "fieldName": "Order Status",
                    "changedFrom": "Fallout",
                    "changedTo": "In Progress",
                    "id": "17730546491390.21583670226957663"
                }
            ]
        },
        "events": [
            {
                "id": "NC4100400228 -3 -14 ",
                "timestamp": "2026-01-19T07:21:54.000Z",
                "status": "remarks",
                "title": "Order Updated ",
                "version": 3,
                "user": "",
                "isExpandable": true,
                "notesType": "remarks",
                "tableData": [
                    {
                        "fieldName": "Order Status",
                        "changedFrom": "Fallout",
                        "changedTo": "In Progress",
                        "id": "17730546491390.21583670226957663"
                    }
                ]
            }
        ],
        "title": "Order Updated "
    },
    {
        "groupId": "NC4100400228 -3 -15 ",
        "isGroup": false,
        "primaryEvent": {
            "id": "NC4100400228 -3 -15 ",
            "timestamp": "2026-01-19T07:21:52.000Z",
            "status": "userRemarks",
            "title": "Fallout for 'O2 Order Completion' closed",
            "version": 3,
            "user": "Mayank Gupta",
            "isExpandable": false,
            "notesType": "userRemarks"
        },
        "events": [
            {
                "id": "NC4100400228 -3 -15 ",
                "timestamp": "2026-01-19T07:21:52.000Z",
                "status": "userRemarks",
                "title": "Fallout for 'O2 Order Completion' closed",
                "version": 3,
                "user": "Mayank Gupta",
                "isExpandable": false,
                "notesType": "userRemarks"
            }
        ],
        "title": "Fallout for 'O2 Order Completion' closed"
    },
    {
        "groupId": "NC4100400228 -3 -16 ",
        "isGroup": false,
        "primaryEvent": {
            "id": "NC4100400228 -3 -16 ",
            "timestamp": "2026-01-19T07:21:14.000Z",
            "status": "remarks",
            "title": "Fallout Created for the task - O2 Order Completion ",
            "version": 3,
            "user": "",
            "isExpandable": false,
            "notesType": "remarks"
        },
        "events": [
            {
                "id": "NC4100400228 -3 -16 ",
                "timestamp": "2026-01-19T07:21:14.000Z",
                "status": "remarks",
                "title": "Fallout Created for the task - O2 Order Completion ",
                "version": 3,
                "user": "",
                "isExpandable": false,
                "notesType": "remarks"
            }
        ],
        "title": "Fallout Created for the task - O2 Order Completion "
    },
    {
        "groupId": "NC4100400228 -3 -17 ",
        "isGroup": false,
        "primaryEvent": {
            "id": "NC4100400228 -3 -17 ",
            "timestamp": "2026-01-19T07:21:14.000Z",
            "status": "fallout",
            "title": "Order Updated ",
            "version": 3,
            "user": "",
            "isExpandable": true,
            "notesType": "remarks",
            "tableData": [
                {
                    "fieldName": "Order Status",
                    "changedFrom": "In Progress",
                    "changedTo": "Fallout",
                    "id": "17730546491390.14179117603510227"
                }
            ]
        },
        "events": [
            {
                "id": "NC4100400228 -3 -17 ",
                "timestamp": "2026-01-19T07:21:14.000Z",
                "status": "fallout",
                "title": "Order Updated ",
                "version": 3,
                "user": "",
                "isExpandable": true,
                "notesType": "remarks",
                "tableData": [
                    {
                        "fieldName": "Order Status",
                        "changedFrom": "In Progress",
                        "changedTo": "Fallout",
                        "id": "17730546491390.14179117603510227"
                    }
                ]
            }
        ],
        "title": "Order Updated "
    },
    {
        "groupId": "NC4100400228 -3 -20 ",
        "isGroup": false,
        "primaryEvent": {
            "id": "NC4100400228 -3 -20 ",
            "timestamp": "2026-01-19T07:21:05.000Z",
            "status": "remarks",
            "title": "Case CS11607857 Updated ",
            "version": 3,
            "user": "",
            "isExpandable": false,
            "notesType": "remarks",
            "note": {
                "Assignment Group": "TSC-Technician Support Center",
                "Case Status": "Open",
                "Category": "EW- Assignment Support Needed",
                "Description": "Error Code - PROGRAMMING_WRK_TKT Error Reason - Programming work tickets have not been completed Error Message - Programming work tickets have not been completed",
                "Sub Assignment Group": "Assignment",
                "Sub Category": "EW-Pending Orders",
                "Work Notes": {
                    "response": {
                        "errorcodetype": "PROGRAMMING_WRK_TKT",
                        "message": "Programming work tickets have not been completed",
                        "status": "UNABLE_TO_COMPLETE"
                    },
                    "status": {
                        "code": "PROGRAMMING_WRK_TKT",
                        "errorcode": "PROGRAMMING_WRK_TKT",
                        "errormessage": "Programming work tickets have not been completed",
                        "message": "Programming work tickets have not been completed"
                    }
                }
            }
        },
        "events": [
            {
                "id": "NC4100400228 -3 -20 ",
                "timestamp": "2026-01-19T07:21:05.000Z",
                "status": "remarks",
                "title": "Case CS11607857 Updated ",
                "version": 3,
                "user": "",
                "isExpandable": false,
                "notesType": "remarks",
                "note": {
                    "Assignment Group": "TSC-Technician Support Center",
                    "Case Status": "Open",
                    "Category": "EW- Assignment Support Needed",
                    "Description": "Error Code - PROGRAMMING_WRK_TKT Error Reason - Programming work tickets have not been completed Error Message - Programming work tickets have not been completed",
                    "Sub Assignment Group": "Assignment",
                    "Sub Category": "EW-Pending Orders",
                    "Work Notes": {
                        "response": {
                            "errorcodetype": "PROGRAMMING_WRK_TKT",
                            "message": "Programming work tickets have not been completed",
                            "status": "UNABLE_TO_COMPLETE"
                        },
                        "status": {
                            "code": "PROGRAMMING_WRK_TKT",
                            "errorcode": "PROGRAMMING_WRK_TKT",
                            "errormessage": "Programming work tickets have not been completed",
                            "message": "Programming work tickets have not been completed"
                        }
                    }
                }
            }
        ],
        "title": "Case CS11607857 Updated "
    },
    {
        "groupId": "NC4100400228 -3 -21 ",
        "isGroup": false,
        "primaryEvent": {
            "id": "NC4100400228 -3 -21 ",
            "timestamp": "2026-01-19T07:21:05.000Z",
            "status": "remarks",
            "title": "Case CS11607857 Created ",
            "version": 3,
            "user": "",
            "isExpandable": false,
            "notesType": "remarks"
        },
        "events": [
            {
                "id": "NC4100400228 -3 -21 ",
                "timestamp": "2026-01-19T07:21:05.000Z",
                "status": "remarks",
                "title": "Case CS11607857 Created ",
                "version": 3,
                "user": "",
                "isExpandable": false,
                "notesType": "remarks"
            }
        ],
        "title": "Case CS11607857 Created "
    },
    {
        "groupId": "NC4100400228 -3 -22 -NC4100400228 -3 -23 ",
        "isGroup": true,
        "primaryEvent": {
            "id": "NC4100400228 -3 -22 ",
            "timestamp": "2026-01-19T07:21:04.000Z",
            "status": "remarks",
            "title": "O2 Order Completion - Task Updated ",
            "version": 3,
            "user": "",
            "isExpandable": true,
            "notesType": "remarks",
            "tableData": [
                {
                    "fieldName": "Status",
                    "changedFrom": "",
                    "changedTo": "On hold",
                    "id": "17730546491390.9733645009789663"
                },
                {
                    "fieldName": "Retried Count",
                    "changedFrom": "",
                    "changedTo": "2",
                    "id": "17730546491390.012524291806116093"
                },
                {
                    "fieldName": "Work notes",
                    "changedFrom": "",
                    "changedTo": "Programming work tickets have not been completed",
                    "id": "17730546491390.45266530172026034"
                },
                {
                    "fieldName": "Execution Status",
                    "changedFrom": "",
                    "changedTo": "UNABLE_TO_COMPLETE",
                    "id": "17730546491390.2834072127074667"
                },
                {
                    "fieldName": "Work notes",
                    "changedFrom": "",
                    "changedTo": "PROGRAMMING_WRK_TKT",
                    "id": "17730546491390.45013088133559575"
                }
            ]
        },
        "events": [
            {
                "id": "NC4100400228 -3 -22 ",
                "timestamp": "2026-01-19T07:21:04.000Z",
                "status": "remarks",
                "title": "O2 Order Completion - Task Updated ",
                "version": 3,
                "user": "",
                "isExpandable": true,
                "notesType": "remarks",
                "tableData": [
                    {
                        "fieldName": "Status",
                        "changedFrom": "",
                        "changedTo": "On hold",
                        "id": "17730546491390.9733645009789663"
                    },
                    {
                        "fieldName": "Retried Count",
                        "changedFrom": "",
                        "changedTo": "2",
                        "id": "17730546491390.012524291806116093"
                    },
                    {
                        "fieldName": "Work notes",
                        "changedFrom": "",
                        "changedTo": "Programming work tickets have not been completed",
                        "id": "17730546491390.45266530172026034"
                    },
                    {
                        "fieldName": "Execution Status",
                        "changedFrom": "",
                        "changedTo": "UNABLE_TO_COMPLETE",
                        "id": "17730546491390.2834072127074667"
                    },
                    {
                        "fieldName": "Work notes",
                        "changedFrom": "",
                        "changedTo": "PROGRAMMING_WRK_TKT",
                        "id": "17730546491390.45013088133559575"
                    }
                ]
            },
            {
                "id": "NC4100400228 -3 -23 ",
                "timestamp": "2026-01-19T07:20:42.000Z",
                "status": "remarks",
                "title": "O2 Order Completion - Task Created ",
                "version": 3,
                "user": "",
                "isExpandable": false,
                "notesType": "remarks",
                "note": "O2 Order Completion - Task Created"
            }
        ],
        "title": "O2 Order Completion"
    },
    {
        "groupId": "NC4100400228 -3 -24 ",
        "isGroup": false,
        "primaryEvent": {
            "id": "NC4100400228 -3 -24 ",
            "timestamp": "2026-01-19T07:10:51.000Z",
            "status": "remarks",
            "title": "BAN Creation Response \u2013 Activation Order received",
            "version": 3,
            "user": "",
            "isExpandable": false,
            "notesType": "remarks",
            "note": "BAN Creation Response \u2013 Activation Order received"
        },
        "events": [
            {
                "id": "NC4100400228 -3 -24 ",
                "timestamp": "2026-01-19T07:10:51.000Z",
                "status": "remarks",
                "title": "BAN Creation Response \u2013 Activation Order received",
                "version": 3,
                "user": "",
                "isExpandable": false,
                "notesType": "remarks",
                "note": "BAN Creation Response \u2013 Activation Order received"
            }
        ],
        "title": "BAN Creation Response \u2013 Activation Order received"
    },
    {
        "groupId": "NC4100400228 -2 -0 ",
        "isGroup": false,
        "primaryEvent": {
            "id": "NC4100400228 -2 -0 ",
            "timestamp": "2026-01-19T07:10:46.000Z",
            "status": "remarks",
            "title": "Order Updated ",
            "version": 2,
            "user": "",
            "isExpandable": true,
            "notesType": "remarks",
            "tableData": [
                {
                    "fieldName": "Order Status",
                    "changedFrom": "Received",
                    "changedTo": "In Progress",
                    "id": "17730546491390.8950479341606863"
                }
            ]
        },
        "events": [
            {
                "id": "NC4100400228 -2 -0 ",
                "timestamp": "2026-01-19T07:10:46.000Z",
                "status": "remarks",
                "title": "Order Updated ",
                "version": 2,
                "user": "",
                "isExpandable": true,
                "notesType": "remarks",
                "tableData": [
                    {
                        "fieldName": "Order Status",
                        "changedFrom": "Received",
                        "changedTo": "In Progress",
                        "id": "17730546491390.8950479341606863"
                    }
                ]
            }
        ],
        "title": "Order Updated "
    },
    {
        "groupId": "NC4100400228 -2 -1 -NC4100400228 -2 -2 ",
        "isGroup": true,
        "primaryEvent": {
            "id": "NC4100400228 -2 -1 ",
            "timestamp": "2026-01-19T07:10:44.000Z",
            "status": "remarks",
            "title": "Workgroup Assignment \u2013 Task Completed ",
            "version": 2,
            "user": "",
            "isExpandable": false,
            "notesType": "remarks"
        },
        "events": [
            {
                "id": "NC4100400228 -2 -1 ",
                "timestamp": "2026-01-19T07:10:44.000Z",
                "status": "remarks",
                "title": "Workgroup Assignment \u2013 Task Completed ",
                "version": 2,
                "user": "",
                "isExpandable": false,
                "notesType": "remarks"
            },
            {
                "id": "NC4100400228 -2 -2 ",
                "timestamp": "2026-01-19T07:10:43.000Z",
                "status": "remarks",
                "title": "Workgroup Assignment \u2013 Task Updated ",
                "version": 2,
                "user": "",
                "isExpandable": true,
                "notesType": "remarks",
                "tableData": [
                    {
                        "fieldName": "Status",
                        "changedFrom": "",
                        "changedTo": "In Progress",
                        "id": "17730546491390.36324929089033224"
                    },
                    {
                        "fieldName": "Retried Count",
                        "changedFrom": "",
                        "changedTo": "0",
                        "id": "17730546491390.0018924313830091115"
                    },
                    {
                        "fieldName": "Task Type",
                        "changedFrom": "",
                        "changedTo": "New",
                        "id": "17730546491390.8334513863930493"
                    }
                ]
            }
        ],
        "title": "Workgroup Assignment"
    },
    {
        "groupId": "NC4100400228 -2 -4 -NC4100400228 -2 -5 ",
        "isGroup": true,
        "primaryEvent": {
            "id": "NC4100400228 -2 -4 ",
            "timestamp": "2026-01-19T07:10:41.000Z",
            "status": "userRemarks",
            "title": "Order Received",
            "version": 2,
            "user": "System",
            "isExpandable": false,
            "notesType": "userRemarks"
        },
        "events": [
            {
                "id": "NC4100400228 -2 -4 ",
                "timestamp": "2026-01-19T07:10:41.000Z",
                "status": "userRemarks",
                "title": "Order Received",
                "version": 2,
                "user": "System",
                "isExpandable": false,
                "notesType": "userRemarks"
            },
            {
                "id": "NC4100400228 -2 -5 ",
                "timestamp": "2026-01-19T07:10:41.000Z",
                "status": "remarks",
                "title": "Order Created ",
                "version": 2,
                "user": "",
                "isExpandable": true,
                "notesType": "remarks",
                "tableData": [
                    {
                        "fieldName": "Order ID",
                        "changedFrom": "",
                        "changedTo": "NC4100400228",
                        "id": "17730546491390.028551012354513616"
                    },
                    {
                        "fieldName": "Order Type",
                        "changedFrom": "",
                        "changedTo": "New Subscription",
                        "id": "17730546491390.7750667103997068"
                    },
                    {
                        "fieldName": "Customer ID",
                        "changedFrom": "",
                        "changedTo": "ACME-123",
                        "id": "17730546491390.09841625649485644"
                    },
                    {
                        "fieldName": "Service Type",
                        "changedFrom": "",
                        "changedTo": "Fiber Install",
                        "id": "17730546491390.6753072606989644"
                    }
                ]
            }
        ],
        "title": "Order Received"
    }
];