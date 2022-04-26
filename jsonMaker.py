import pandas as pd
import numpy as np
import json as JSON

sheet = pd.read_csv('Events - Sheet1.csv', sep=',')
df = pd.DataFrame(sheet)
data = []
for i in range(1,len(df)):
    try:
        if(np.isnan(df.iloc[i, 0])):
            pass
    except:
        eventData = []
        for x in list(df.iloc[i, :].values)[:10]:
            if not pd.isnull(x):
                eventData.append(x)
            else:
                eventData.append("")
        data.append(eventData)
columns = list(df.columns)[0:10]

json = []
for row in data:
    dict = {}
    for i in range(len(row)):
        dict[columns[i]] = row[i]
    json.append(dict)
json = JSON.dumps(json)

with open("sample.json", "w") as jsonfile:
    jsonfile.write(json)