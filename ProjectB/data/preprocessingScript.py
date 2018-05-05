import pandas as pd
import numpy as np

terrorEU=pd.read_csv('C:\\Users\\Georg\\Desktop\\SocialCourse\\WebsiteGit\\senbyo.github.io\\ProjectB\\data\\terror_EU_processed_data.csv',encoding='latin-1')
cols = np.array(terrorEU["AttackType"].value_counts().index)
terror_new = pd.DataFrame()
years = range(1970,2017)
data_needed = terrorEU[["Year","AttackType","Group","Victims"]]

for year in years:
    terror_new["Year"] = year
    temp = data_needed[data_needed["Year"]==year]
    #terror_new[cols[0]] = temp[temp["AttackType"]==cols[0]]
year = 2015    
terror_new["Year"] = year
temp = data_needed[data_needed["Year"]==year]
terror_new[cols[0]] = [temp["Victims"].sum()]
#find count of specific group in order
terror_new[cols[1]] = [temp["Victims"].loc[temp["Group"]==temp["Group"].value_counts().index[0]].sum()]
#now use above with i groups and store
#then use and group with attack type