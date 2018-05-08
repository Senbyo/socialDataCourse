import pandas as pd
import numpy as np
import seaborn as sns
groupsNum = 4
terrorEU=pd.read_csv('C:\\Users\\Georg\\Desktop\\SocialCourse\\WebsiteGit\\senbyo.github.io\\ProjectB\\data\\terror_EU_processed_data.csv',encoding='latin-1')
cols = terrorEU["AttackType"].value_counts().index
terror_new = pd.DataFrame(columns = [val for val in cols])
terror_new["Year"] = 0
terror_new["Victims"] = 0

#change order of columns
tempcols = terror_new.columns.tolist()
tempcols = [tempcols[-1]]+tempcols[:-1] # or whatever change you need
tempcols = [tempcols[-1]]+tempcols[:-1] # or whatever change you need
terror_new = terror_new.reindex(columns=tempcols)

years = range(1970,2017)
data_needed = terrorEU[["Year","AttackType","Group","Victims"]]
terrorEU["Victims"] = terrorEU["Victims"].fillna(0)

#for year in years:
 #   terror_new.loc[terror_new.index.max() + 1] = year
 #   temp = data_needed[data_needed["Year"]==year]
    #terror_new[cols[0]] = temp[temp["AttackType"]==cols[0]]
year = 1973 
  
terror_new.loc[terror_new.index.max() + 1] = [year,0,0,0,0,0,0,0,0,0,0]
temp = data_needed[data_needed["Year"]==year]
terror_new["Victims"].loc[terror_new.index.max()] = temp["Victims"].sum()

#find count of specific group in order
# terror_new[cols[i]] = [temp["Victims"].loc[temp["Group"]==temp["Group"].value_counts().index[i]].sum()]
#first row
for i,val in enumerate(cols):
    print(i)
    print(val)
    topVictimValues=temp["Group"].value_counts()
    if(len(topVictimValues)>i):
        terror_new[val] = topVictimValues[i]
    else:        
        terror_new[val] = 0

            
terror_new= terror_new.astype(int)
terror_new["Group"] = "All"
#second row
for groupN in range(0,groupsNum+1):
    highestGroupInLoop = temp["Group"].value_counts().index[groupN]
    bombing = temp["Group"].loc[(temp["AttackType"]==cols[0]) & (temp["Group"]==highestGroupInLoop)].count()
    assas = temp["Group"].loc[(temp["AttackType"]==cols[1]) & (temp["Group"]==highestGroupInLoop)].count()
    armed = temp["Group"].loc[(temp["AttackType"]==cols[2]) & (temp["Group"]==highestGroupInLoop)].count()
    infr = temp["Group"].loc[(temp["AttackType"]==cols[3]) & (temp["Group"]==highestGroupInLoop)].count()
    kidn =temp["Group"].loc[(temp["AttackType"]==cols[4]) & (temp["Group"]==highestGroupInLoop)].count()
    unk = temp["Group"].loc[(temp["AttackType"]==cols[5]) & (temp["Group"]==highestGroupInLoop)].count()
    unarm = temp["Group"].loc[(temp["AttackType"]==cols[6]) & (temp["Group"]==highestGroupInLoop)].count()
    hostage = temp["Group"].loc[(temp["AttackType"]==cols[7]) & (temp["Group"]==highestGroupInLoop)].count()
    hij = temp["Group"].loc[(temp["AttackType"]==cols[8]) & (temp["Group"]==highestGroupInLoop)].count()
    allsum= bombing+assas+armed+infr+kidn+unk+unarm+hostage+hij
    terror_new.loc[terror_new.index.max() + 1] = np.array([year,allsum,bombing,assas,armed,infr,kidn,unk,unarm,hostage,hij,highestGroupInLoop])
sns.barplot(temp['Group'].value_counts()[0:15].values,temp['Group'].value_counts()[0:15].index,palette=('inferno'))    
#now use above with i groups and store
#then use and group with attack type