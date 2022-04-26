import copy
import pandas as pd
import json 

class Team:
    eventName=None
    teamName=None
    leader=None
    Email=None
    members=[]
    memberEmail=[]


df = pd.read_csv('TeamData.csv')
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
    dict[templist[2]] = templist

for x in range(len(df)):
    leader = json.loads(df.iloc[x,2])["Name"]
    # if(df.iloc[x,3] == nan):
    #     continue
    # print(df.iloc[x,3])
    try:
        object = json.loads(df.iloc[x,3])
        dict[leader].append(object["Name"])
        dict[leader].append(object["Email"])
        maxsz = max(maxsz,(len(dict[leader])-4)//2)
    except:
        continue

list2 = ["Event Name","Team Name","Leader","Email"]
for i in range(maxsz):
    list2.append(f"Member{i+1}")
    list2.append(f"MemberEmail{i+1}")

df2 = pd.DataFrame(columns=list2)


for x in dict:
    templist = copy.deepcopy(dict[x])
    tempsz=maxsz - (len(templist) - 4)//2
    for x in range(tempsz):
        templist.append('null')
        templist.append('null')    
  
    df2.loc[len(df2.index)] = templist

df2.to_csv("TestData.csv")


