import copy
import pandas as pd
import json 
import os

class Team:
    eventName=None
    teamName=None
    leader=None
    Email=None
    phoneNUmber = None
    members=[]
    memberEmail=[]
    memberNumber=[]

# print(os.path)
df = pd.read_csv('Celaeno.csv')
dict = {}
maxsz=0
list=[]
for x in range(len(df)):
    templist = copy.deepcopy(list);
    # copytemp = copy.deepcopy(Team())
    # temp = copy.deepcopy(copytemp)
    templist.append(df.iloc[x,0])
    templist.append(df.iloc[x,1])
    leaderObject = json.loads(df.iloc[x,2])
    templist.append(leaderObject["Name"])
    templist.append(leaderObject["Email"])
    templist.append(leaderObject["PhNo."])
    dict[templist[2]] = templist

for x in range(len(df)):
    # print(x)
    leader = json.loads(df.iloc[x,2])["Name"]
    # if(df.iloc[x,3] == nan):
    #     continue
    # print(df.iloc[x,3])
    try:

        objects = json.loads(df.iloc[x,3])
        for object in objects:    
            object = json.loads(object)
            # print(object["Name"])
            dict[leader].append(object["Name"])
            dict[leader].append(object["Email"])
            dict[leader].append(object["PhNo."])
            # print("this is length ",len(dict[leader]))
            maxsz = max(maxsz,(len(dict[leader])-5)//3)
    except:
        continue

list2 = ["Event Name","Team Name","Leader","Email","PhNo."]
for i in range(maxsz):
    list2.append(f"Member{i+1}")
    list2.append(f"MemberEmail{i+1}")
    list2.append(f"MemberNumber{i+1}")

df2 = pd.DataFrame(columns=list2)


for x in dict:
    templist = copy.deepcopy(dict[x])
    tempsz=maxsz - (len(templist) - 5)//3
    for x in range(tempsz):
        templist.append('')
        templist.append('')    
        templist.append('')
  
    df2.loc[len(df2.index)] = templist

df2.to_csv("TestData.csv")


