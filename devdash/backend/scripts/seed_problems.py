import json
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.codingproblem import CodingProblem
from app.core.config import settings

PROBLEMS = [
    {
        "title": "Two Sum",
        "slug": "two-sum",
        "difficulty": "Easy",
        "description": """
Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:\n\n
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

""",
        "example_cases": [
            {
                "input": {"nums": [2, 7, 11, 15], "target": 9},
                "output": [0, 1]
            },
            {
                "input": {"nums": [3, 2, 4], "target": 6},
                "output": [1, 2]
            }
        ],
        "test_cases": [
            {
                "input": {"nums": [2, 7, 11, 15], "target": 9},
                "output": [0, 1]
            },
            {
                "input": {"nums": [3, 2, 4], "target": 6},
                "output": [1, 2]
            },
            {
                "input": {"nums": [3, 3], "target": 6},
                "output": [0, 1]
            },
            {
                "input": {"nums": [1, 2, 3, 4, 5], "target": 9},
                "output": [3, 4]
            },
            {
                "input": {"nums": [-1, -2, -3, -4, -5], "target": -8},
                "output": [2, 4]
            },
            {
                "input": {"nums": [0, 0], "target": 0},
                "output": [0, 1]
            }
        ],
        "starter_code": {
            "python": "def solution(nums, target):\n    # Your code here\n    pass",
            "javascript": "function solution(nums, target) {\n    // Your code here\n}",
            "java": "class Solution {\n    public int[] solution(int[] nums, int target) {\n        // Your code here\n        return new int[]{0, 0};\n    }\n}",
            "cpp": "std::vector<int> solution(std::vector<int>& nums, int target) {\n    // Your code here\n    return {};\n}"
        },
        "example_input": "nums"
    },
    
    {
        "title": "Valid Parentheses",
        "slug": "valid-parentheses",
        "difficulty": "Easy",
        "description": """
Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

Example:
Input: s = "()[]{}"
Output: True
""",
        "example_cases": [
            {
                "input": {"s": "()"},
                "output": True
            },
            {
                "input": {"s": "()[]{}"},
                "output": True
            },
            {
                "input": {"s": "(]"},
                "output": False
            }
        ],
        "test_cases": [
            {
                "input": {"s": "()"},
                "output": True
            },
            {
                "input": {"s": "()[]{}"},
                "output": True
            },
            {
                "input": {"s": "(]"},
                "output": False
            },
            {
                "input": {"s": "([)]"},
                "output": False
            },
            {
                "input": {"s": "{[]}"},
                "output": True
            },
            {
                "input": {"s": ""},
                "output": True
            },
            {
                "input": {"s": "]"},
                "output": False
            },
            {
                "input": {"s": "(("},
                "output": False
            },
            {
                "input": {"s": "({[{()}]})"},
                "output": True
            }
        ],
        "starter_code": {
            "python": "def solution(s):\n    # Your code here\n    pass",
            "javascript": "function solution(s) {\n    // Your code here\n}",
            "java": "class Solution {\n    public boolean solution(String s) {\n        // Your code here\n        return false;\n    }\n}",
            "cpp": "bool solution(std::string s) {\n    // Your code here\n    return false;\n}"
        },
        "example_input" : "s"

    },
    
    {
        "title": "Reverse Linked List",
        "slug": "reverse-linked-list",
        "difficulty": "Easy",
        "description": """
Given the head of a singly linked list, reverse the list, and return the reversed list.

A linked list is represented in the input as an array. For example, the linked list 1->2->3->4->5 is represented as [1,2,3,4,5].

Example:
Input: head = [1,2,3,4,5]
Output: [5,4,3,2,1]
""",
        "example_cases": [
            {
                "input": {"head": [1, 2, 3, 4, 5]},
                "output": [5, 4, 3, 2, 1]
            },
            {
                "input": {"head": [1, 2]},
                "output": [2, 1]
            }
        ],
        "test_cases": [
            {
                "input": {"head": [1, 2, 3, 4, 5]},
                "output": [5, 4, 3, 2, 1]
            },
            {
                "input": {"head": [1, 2]},
                "output": [2, 1]
            },
            {
                "input": {"head": []},
                "output": []
            },
            {
                "input": {"head": [1]},
                "output": [1]
            },
            {
                "input": {"head": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]},
                "output": [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
            }
        ],
        "starter_code": {
            "python": "def solution(head):\n    # Input is an array representation of a linked list\n    # Your code should reverse this list\n    # Return the reversed list as an array\n    pass",
            "javascript": "function solution(head) {\n    // Input is an array representation of a linked list\n    // Your code should reverse this list\n    // Return the reversed list as an array\n}",
            "java": "class Solution {\n    public int[] solution(int[] head) {\n        // Input is an array representation of a linked list\n        // Your code should reverse this list\n        // Return the reversed list as an array\n        return new int[]{};\n    }\n}",
            "cpp": "std::vector<int> solution(std::vector<int>& head) {\n    // Input is an array representation of a linked list\n    // Your code should reverse this list\n    // Return the reversed list as an array\n    return {};\n}"
        },
        "example_input" : "head"

    },
    
    {
        "title": "Maximum Subarray",
        "slug": "maximum-subarray",
        "difficulty": "Medium",
        "description": """
Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

A subarray is a contiguous part of an array.

Example:
Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
Output: 6
Explanation: [4,-1,2,1] has the largest sum = 6.
""",
        "example_cases": [
            {
                "input": {"nums": [-2, 1, -3, 4, -1, 2, 1, -5, 4]},
                "output": 6
            },
            {
                "input": {"nums": [1]},
                "output": 1
            }
        ],
        "test_cases": [
            {
                "input": {"nums": [-2, 1, -3, 4, -1, 2, 1, -5, 4]},
                "output": 6
            },
            {
                "input": {"nums": [1]},
                "output": 1
            },
            {
                "input": {"nums": [5, 4, -1, 7, 8]},
                "output": 23
            },
            {
                "input": {"nums": [-1]},
                "output": -1
            },
            {
                "input": {"nums": [-2, -1]},
                "output": -1
            },
            {
                "input": {"nums": [-2, 1]},
                "output": 1
            },
            {
                "input": {"nums": [-1, -2, -3, -4, -5]},
                "output": -1
            },
            {
                "input": {"nums": [0]},
                "output": 0
            }
        ],
        "starter_code": {
            "python": "def solution(nums):\n    # Your code here\n    pass",
            "javascript": "function solution(nums) {\n    // Your code here\n}",
            "java": "class Solution {\n    public int solution(int[] nums) {\n        // Your code here\n        return 0;\n    }\n}",
            "cpp": "int solution(std::vector<int>& nums) {\n    // Your code here\n    return 0;\n}"
        },
        "example_input" : "nums"

    },
    
    {
        "title": "Merge Intervals",
        "slug": "merge-intervals",
        "difficulty": "Medium",
        "description": """
Given an array of `intervals` where intervals[i] = [starti, endi], merge all overlapping intervals, and return an array of the non-overlapping intervals that cover all the intervals in the input.

Example:
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].
""",
        "example_cases": [
            {
                "input": {"intervals": [[1, 3], [2, 6], [8, 10], [15, 18]]},
                "output": [[1, 6], [8, 10], [15, 18]]
            },
            {
                "input": {"intervals": [[1, 4], [4, 5]]},
                "output": [[1, 5]]
            }
        ],
        "test_cases": [
            {
                "input": {"intervals": [[1, 3], [2, 6], [8, 10], [15, 18]]},
                "output": [[1, 6], [8, 10], [15, 18]]
            },
            {
                "input": {"intervals": [[1, 4], [4, 5]]},
                "output": [[1, 5]]
            },
            {
                "input": {"intervals": [[1, 4], [0, 4]]},
                "output": [[0, 4]]
            },
            {
                "input": {"intervals": [[1, 4], [2, 3]]},
                "output": [[1, 4]]
            },
            {
                "input": {"intervals": [[1, 4], [0, 0]]},
                "output": [[0, 0], [1, 4]]
            },
            {
                "input": {"intervals": [[1, 10], [2, 3], [4, 5], [6, 7], [8, 9]]},
                "output": [[1, 10]]
            },
            {
                "input": {"intervals": [[1, 3], [4, 6], [7, 10], [11, 15], [16, 18]]},
                "output": [[1, 3], [4, 6], [7, 10], [11, 15], [16, 18]]
            }
        ],
        "starter_code": {
            "python": "def solution(intervals):\n    # Your code here\n    pass",
            "javascript": "function solution(intervals) {\n    // Your code here\n}",
            "java": "class Solution {\n    public int[][] solution(int[][] intervals) {\n        // Your code here\n        return new int[][]{};\n    }\n}",
            "cpp": "std::vector<std::vector<int>> solution(std::vector<std::vector<int>>& intervals) {\n    // Your code here\n    return {};\n}"
        },
        "example_input" : "intervals"
    },
    
    {
        "title": "Binary Search",
        "slug": "binary-search",
        "difficulty": "Easy",
        "description": """
Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.

Example:
Input: nums = [-1,0,3,5,9,12], target = 9
Output: 4
Explanation: 9 exists in nums and its index is 4
""",
        "example_cases": [
            {
                "input": {"nums": [-1, 0, 3, 5, 9, 12], "target": 9},
                "output": 4
            },
            {
                "input": {"nums": [-1, 0, 3, 5, 9, 12], "target": 2},
                "output": -1
            }
        ],
        "test_cases": [
            {
                "input": {"nums": [-1, 0, 3, 5, 9, 12], "target": 9},
                "output": 4
            },
            {
                "input": {"nums": [-1, 0, 3, 5, 9, 12], "target": 2},
                "output": -1
            },
            {
                "input": {"nums": [5], "target": 5},
                "output": 0
            },
            {
                "input": {"nums": [5], "target": 6},
                "output": -1
            },
            {
                "input": {"nums": [], "target": 0},
                "output": -1
            },
            {
                "input": {"nums": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "target": 1},
                "output": 0
            },
            {
                "input": {"nums": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], "target": 10},
                "output": 9
            },
            {
                "input": {"nums": [1, 1, 1, 1, 1, 1, 1], "target": 1},
                "output": 3
            }
        ],
        "starter_code": {
            "python": "def solution(nums, target):\n    # Your code here\n    pass",
            "javascript": "function solution(nums, target) {\n    // Your code here\n}",
            "java": "class Solution {\n    public int solution(int[] nums, int target) {\n        // Your code here\n        return -1;\n    }\n}",
            "cpp": "int solution(std::vector<int>& nums, int target) {\n    // Your code here\n    return -1;\n}"
        },
        "example_input" : "nums"

    },
    
    {
        "title": "Longest Palindromic Substring",
        "slug": "longest-palindromic-substring",
        "difficulty": "Medium",
        "description": """
Given a string `s`, return the longest palindromic substring in `s`.

A palindrome is a string that reads the same backward as forward.

Example:
Input: s = "babad"
Output: "bab"
Explanation: "aba" is also a valid answer.
""",
        "example_cases": [
            {
                "input": {"s": "babad"},
                "output": "bab"
            },
            {
                "input": {"s": "cbbd"},
                "output": "bb"
            }
        ],
        "test_cases": [
            {
                "input": {"s": "babad"},
                "output": "bab"
            },
            {
                "input": {"s": "cbbd"},
                "output": "bb"
            },
            {
                "input": {"s": "a"},
                "output": "a"
            },
            {
                "input": {"s": "ac"},
                "output": "a"
            },
            {
                "input": {"s": ""},
                "output": ""
            },
            {
                "input": {"s": "racecar"},
                "output": "racecar"
            },
            {
                "input": {"s": "aacabdkacaa"},
                "output": "aca"
            },
            {
                "input": {"s": "aaaa"},
                "output": "aaaa"
            }
        ],
        "starter_code": {
            "python": "def solution(s):\n    # Your code here\n    pass",
            "javascript": "function solution(s) {\n    // Your code here\n}",
            "java": "class Solution {\n    public String solution(String s) {\n        // Your code here\n        return \"\";\n    }\n}",
            "cpp": "std::string solution(std::string s) {\n    // Your code here\n    return \"\";\n}"
        },
        "example_input": "s"
    },
    
    {
        "title": "Trapping Rain Water",
        "slug": "trapping-rain-water",
        "difficulty": "Hard",
        "description": """
Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

Example:
Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
Output: 6
Explanation: The elevation map is shown above. In this case, 6 units of rain water are trapped.
""",
        "example_cases": [
            {
                "input": {"height": [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]},
                "output": 6
            },
            {
                "input": {"height": [4, 2, 0, 3, 2, 5]},
                "output": 9
            }
        ],
        "test_cases": [
            {
                "input": {"height": [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]},
                "output": 6
            },
            {
                "input": {"height": [4, 2, 0, 3, 2, 5]},
                "output": 9
            },
            {
                "input": {"height": []},
                "output": 0
            },
            {
                "input": {"height": [1]},
                "output": 0
            },
            {
                "input": {"height": [1, 2, 3, 4, 5]},
                "output": 0
            },
            {
                "input": {"height": [5, 4, 3, 2, 1]},
                "output": 0
            },
            {
                "input": {"height": [5, 2, 1, 2, 1, 5]},
                "output": 14
            },
            {
                "input": {"height": [0, 0, 0, 0]},
                "output": 0
            }
        ],
        "starter_code": {
            "python": "def solution(height):\n    # Your code here\n    pass",
            "javascript": "function solution(height) {\n    // Your code here\n}",
            "java": "class Solution {\n    public int solution(int[] height) {\n        // Your code here\n        return 0;\n    }\n}",
            "cpp": "int solution(std::vector<int>& height) {\n    // Your code here\n    return 0;\n}"
        },
        "example_input" : "height"
    },
    
    {
        "title": "Word Break",
        "slug": "word-break",
        "difficulty": "Medium",
        "description": """
Given a string `s` and a dictionary of strings `wordDict`, return `true` if `s` can be segmented into a space-separated sequence of one or more dictionary words.

Note that the same word in the dictionary may be reused multiple times in the segmentation.

Example:
Input: s = "leetcode", wordDict = ["leet","code"]
Output: True
Explanation: Return true because "leetcode" can be segmented as "leet code".
""",
        "example_cases": [
            {
                "input": {"s": "leetcode", "wordDict": ["leet", "code"]},
                "output": True
            },
            {
                "input": {"s": "applepenapple", "wordDict": ["apple", "pen"]},
                "output": True
            }
        ],
        "test_cases": [
            {
                "input": {"s": "leetcode", "wordDict": ["leet", "code"]},
                "output": True
            },
            {
                "input": {"s": "applepenapple", "wordDict": ["apple", "pen"]},
                "output": True
            },
            {
                "input": {"s": "catsandog", "wordDict": ["cats", "dog", "sand", "and", "cat"]},
                "output": False
            },
            {
                "input": {"s": "", "wordDict": ["cat"]},
                "output": True
            },
            {
                "input": {"s": "aaaaaaa", "wordDict": ["aaaa", "aaa"]},
                "output": True
            },
            {
                "input": {"s": "aaaaaaa", "wordDict": ["aaaa", "aa"]},
                "output": False
            },
            {
                "input": {"s": "abcd", "wordDict": ["a", "abc", "b", "cd"]},
                "output": True
            },
            {
                "input": {"s": "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaab", 
                          "wordDict": ["a","aa","aaa","aaaa","aaaaa"]},
                "output": False
            }
        ],
        "starter_code": {
            "python": "def solution(s, wordDict):\n    # Your code here\n    pass",
            "javascript": "function solution(s, wordDict) {\n    // Your code here\n}",
            "java": "class Solution {\n    public boolean solution(String s, List<String> wordDict) {\n        // Your code here\n        return false;\n    }\n}",
            "cpp": "bool solution(std::string s, std::vector<std::string>& wordDict) {\n    // Your code here\n    return false;\n}"
        },
        "example_input" : "s"
    },
    
    {
        "title": "Median of Two Sorted Arrays",
        "slug": "median-of-two-sorted-arrays",
        "difficulty": "Hard",
        "description": """
Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays.

The overall run time complexity should be O(log (m+n)).

Example:
Input: nums1 = [1,3], nums2 = [2]
Output: 2.0
Explanation: The median is 2.0
""",
        "example_cases": [
            {
                "input": {"nums1": [1, 3], "nums2": [2]},
                "output": 2.0
            },
            {
                "input": {"nums1": [1, 2], "nums2": [3, 4]},
                "output": 2.5
            }
        ],
        "test_cases": [
            {
                "input": {"nums1": [1, 3], "nums2": [2]},
                "output": 2.0
            },
            {
                "input": {"nums1": [1, 2], "nums2": [3, 4]},
                "output": 2.5
            },
            {
                "input": {"nums1": [], "nums2": [1]},
                "output": 1.0
            },
            {
                "input": {"nums1": [2], "nums2": []},
                "output": 2.0
            },
            {
                "input": {"nums1": [], "nums2": [2, 3]},
                "output": 2.5
            },
            {
                "input": {"nums1": [1, 3, 5, 7, 9], "nums2": [2, 4, 6, 8, 10]},
                "output": 5.5
            },
            {
                "input": {"nums1": [1, 3, 5, 7, 9, 11], "nums2": [2, 4, 6, 8, 10]},
                "output": 6.0
            },
            {
                "input": {"nums1": [1, 3, 5, 7, 9, 11], "nums2": [1, 3, 5, 7, 9, 11]},
                "output": 6.0
            }
        ],
        "starter_code": {
            "python": "def solution(nums1, nums2):\n    # Your code here\n    pass",
            "javascript": "function solution(nums1, nums2) {\n    // Your code here\n}",
            "java": "class Solution {\n    public double solution(int[] nums1, int[] nums2) {\n        // Your code here\n        return 0.0;\n    }\n}",
            "cpp": "double solution(std::vector<int>& nums1, std::vector<int>& nums2) {\n    // Your code here\n    return 0.0;\n}"
        },
        "example_input" : "nums1, nums2"

    }
]

def seed_problems():
    '''seed databse with coding problems'''
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(bind=engine)
    db = SessionLocal()

    try:
        #check if problems exist
        existing_count = db.query(CodingProblem).count()
        if existing_count > 0:
            print(f"Databse contains {existing_count} problems.")
            should_continue = input("Continue and potentially overwrite? (y/n): ")
            if should_continue.lower() != 'y':
                print("Exiting without changes.")
                return

        #add each problem
        for problem_data in PROBLEMS:
            #check if problem exists
            existing = db.query(CodingProblem).filter(CodingProblem.slug == problem_data["slug"]).first()

            if existing:
                #update existing problem
                for key, value in problem_data.items():
                    setattr(existing, key, value)
                print(f"Updated problem: {problem_data['title']}")

            else:
                #create new problem
                problem = CodingProblem(**problem_data)
                db.add(problem)
                print(f"Added problem: {problem_data['title']}")
        db.commit()
        print("Database seeded successfully")
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_problems()
