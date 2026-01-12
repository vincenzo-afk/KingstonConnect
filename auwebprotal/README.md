# AU Web Portal API
A Python API using Flask microframework, to retrieve student details from Anna University web portal in JSON fromat.

## Setup

```
$ brew install pip
$ pip install virtualenv
$ cd path/to/auwebportal
$ virtualenv venv
$ source venv/bin/activate
$ pip install -r requirements.txt
$ python wsgi.py
```

## How to consume?
Send GET request to our endpoint, the Register Number and the Date of Birth of the student.

### Request
####GET:  
http://localhost:8080/get/?register_no=rno&dob=dob

### Response
#### JSON:
```
{
    "assessment": [
        {
            "report_period1": {
                "assesment_mark": null,
                "attended_period": "22",
                "total_period": "22"
            },
            "report_period2": {
                "assesment_mark": "100",
                "attended_period": "25",
                "total_period": "25"
            },
            "report_period3": {
                "assesment_mark": "67",
                "attended_period": "16",
                "total_period": "17"
            },
            "report_period4": {
                "assesment_mark": "67",
                "attended_period": "12",
                "total_period": "15"
            },
            "subject_code": "CS2032"
        },
        {
            "report_period1": {
                "assesment_mark": null,
                "attended_period": "23",
                "total_period": "25"
            },
            "report_period2": {
                "assesment_mark": "100",
                "attended_period": "23",
                "total_period": "25"
            },
            "report_period3": {
                "assesment_mark": "94",
                "attended_period": "16",
                "total_period": "16"
            },
            "report_period4": {
                "assesment_mark": "100",
                "attended_period": "16",
                "total_period": "16"
            },
            "subject_code": "CS2041"
        },
        {
            "report_period1": {
                "assesment_mark": null,
                "attended_period": "22",
                "total_period": "25"
            },
            "report_period2": {
                "assesment_mark": "46",
                "attended_period": "20",
                "total_period": "22"
            },
            "report_period3": {
                "assesment_mark": "86",
                "attended_period": "14",
                "total_period": "16"
            },
            "report_period4": {
                "assesment_mark": "70",
                "attended_period": "9",
                "total_period": "13"
            },
            "subject_code": "CS2401"
        },
        {
            "report_period1": {
                "assesment_mark": null,
                "attended_period": "24",
                "total_period": "25"
            },
            "report_period2": {
                "assesment_mark": "67",
                "attended_period": "20",
                "total_period": "21"
            },
            "report_period3": {
                "assesment_mark": "100",
                "attended_period": "14",
                "total_period": "17"
            },
            "report_period4": {
                "assesment_mark": "86",
                "attended_period": "10",
                "total_period": "13"
            },
            "subject_code": "CS2402"
        },
        {
            "report_period1": {
                "assesment_mark": null,
                "attended_period": "23",
                "total_period": "27"
            },
            "report_period2": {
                "assesment_mark": "22",
                "attended_period": "17",
                "total_period": "20"
            },
            "report_period3": {
                "assesment_mark": "100",
                "attended_period": "16",
                "total_period": "19"
            },
            "report_period4": {
                "assesment_mark": "74",
                "attended_period": "14",
                "total_period": "17"
            },
            "subject_code": "CS2403"
        },
        {
            "report_period1": {
                "assesment_mark": null,
                "attended_period": "",
                "total_period": ""
            },
            "report_period2": {
                "assesment_mark": "",
                "attended_period": "",
                "total_period": ""
            },
            "report_period3": {
                "assesment_mark": "",
                "attended_period": "",
                "total_period": ""
            },
            "report_period4": {
                "assesment_mark": "100",
                "attended_period": "59",
                "total_period": "59"
            },
            "subject_code": "CS2405"
        },
        {
            "report_period1": {
                "assesment_mark": null,
                "attended_period": "",
                "total_period": ""
            },
            "report_period2": {
                "assesment_mark": "",
                "attended_period": "",
                "total_period": ""
            },
            "report_period3": {
                "assesment_mark": "",
                "attended_period": "",
                "total_period": ""
            },
            "report_period4": {
                "assesment_mark": "100",
                "attended_period": "55",
                "total_period": "58"
            },
            "subject_code": "CS2406"
        },
        {
            "report_period1": {
                "assesment_mark": null,
                "attended_period": "21",
                "total_period": "24"
            },
            "report_period2": {
                "assesment_mark": "78",
                "attended_period": "25",
                "total_period": "25"
            },
            "report_period3": {
                "assesment_mark": "74",
                "attended_period": "14",
                "total_period": "16"
            },
            "report_period4": {
                "assesment_mark": "99",
                "attended_period": "10",
                "total_period": "10"
            },
            "subject_code": "MG2452"
        }
    ],
    "electives": [
        {
            "code": "CS2032",
            "name": "DATA WAREHOUSING AND DATA MINING"
        },
        {
            "code": "CS2041",
            "name": "C# AND .NET FRAMEWORK"
        }
    ],
    "exam_result": {
        "meta": "Result for April / May  2014",
        "results": [
            {
                "grade": "C",
                "result": "PASS",
                "semester": "06",
                "subject_code": "CS2351"
            },
            {
                "grade": "B",
                "result": "PASS",
                "semester": "06",
                "subject_code": "CS2352"
            },
            {
                "grade": "C",
                "result": "PASS",
                "semester": "06",
                "subject_code": "CS2353"
            },
            {
                "grade": "D",
                "result": "PASS",
                "semester": "06",
                "subject_code": "CS2354"
            },
            {
                "grade": "S",
                "result": "PASS",
                "semester": "06",
                "subject_code": "CS2357"
            },
            {
                "grade": "S",
                "result": "PASS",
                "semester": "06",
                "subject_code": "CS2358"
            },
            {
                "grade": "A",
                "result": "PASS",
                "semester": "06",
                "subject_code": "GE2321"
            },
            {
                "grade": "C",
                "result": "PASS",
                "semester": "06",
                "subject_code": "IT2353"
            },
            {
                "grade": "C",
                "result": "PASS",
                "semester": "06",
                "subject_code": "MA2264"
            }
        ]
    },
    "exam_reval_result": {
        "meta": "Revaluation / Photocopy Result",
        "results": [
            {
                "grade": "B",
                "result": "PASS",
                "semester": "06",
                "subject_code": "CS2352"
            }
        ]
    },
    "exam_schedule": [
        {
            "exam_date": "10-11-2014",
            "semester": "07",
            "session": "FN",
            "subject": "CS2041 - C# AND .NET FRAMEWORK"
        },
        {
            "exam_date": "09-12-2014",
            "semester": "07",
            "session": "AN",
            "subject": "CS2032 - DATA WAREHOUSING AND DATA MINING"
        },
        {
            "exam_date": "13-12-2014",
            "semester": "07",
            "session": "FN",
            "subject": "MG2452 - ENGINEERING ECONOMICS AND FINANCIAL ACCOUNTING"
        },
        {
            "exam_date": "17-12-2014",
            "semester": "07",
            "session": "FN",
            "subject": "CS2401 - COMPUTER GRAPHICS"
        },
        {
            "exam_date": "18-12-2014",
            "semester": "07",
            "session": "FN",
            "subject": "CS2402 - MOBILE AND PERVASIVE COMPUTING"
        },
        {
            "exam_date": "20-12-2014",
            "semester": "07",
            "session": "FN",
            "subject": "CS2403 - DIGITAL SIGNAL PROCESSING"
        }
    ],
    "internals": [
        {
            "exam_absentees": "-",
            "internal_mark": "17",
            "semester": "07",
            "subject": "CS2032 - DATA WAREHOUSING AND DATA MINING"
        },
        {
            "exam_absentees": "-",
            "internal_mark": "20",
            "semester": "07",
            "subject": "CS2041 - C# AND .NET FRAMEWORK"
        },
        {
            "exam_absentees": "-",
            "internal_mark": "15",
            "semester": "07",
            "subject": "CS2401 - COMPUTER GRAPHICS"
        },
        {
            "exam_absentees": "-",
            "internal_mark": "18",
            "semester": "07",
            "subject": "CS2402 - MOBILE AND PERVASIVE COMPUTING"
        },
        {
            "exam_absentees": "-",
            "internal_mark": "15",
            "semester": "07",
            "subject": "CS2403 - DIGITAL SIGNAL PROCESSING"
        },
        {
            "exam_absentees": "-",
            "internal_mark": "20",
            "semester": "07",
            "subject": "CS2405 - COMPUTER GRAPHICS LAB"
        },
        {
            "exam_absentees": "-",
            "internal_mark": "20",
            "semester": "07",
            "subject": "CS2406 - OPEN SOURCE LAB"
        },
        {
            "exam_absentees": "-",
            "internal_mark": "18",
            "semester": "07",
            "subject": "MG2452 - ENGINEERING ECONOMICS AND FINANCIAL ACCOUNTING"
        }
    ],
    "profile": {
        "branch": "104-B.E. Computer Science and Engineering",
        "institution": "MY_INSTITUTION",
        "name": "MY_NAME",
        "register_number": "MY_REGISTER_NUMBER"
    }
}
```
