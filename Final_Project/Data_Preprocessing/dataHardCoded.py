import pandas as pd
import numpy as np
import seaborn as sns
from utilsFinal import makeRowForGroup
terrorEU=pd.read_csv('C:\\Users\\Georg\\Desktop\\SocialCourse\\WebsiteGit\\senbyo.github.io\\ProjectB\\data\\terror_EU_processed_data.csv',encoding='latin-1')

years = range(1970,2017)
terrorEU["Victims"] = terrorEU["Victims"].fillna(0)
attackTypes = terrorEU["AttackType"].value_counts().index
data_needed = terrorEU[["Year","AttackType","Group","Victims"]]
finalDf = pd.DataFrame(columns = ["Year","Attacks",attackTypes[0],attackTypes[1],attackTypes[2],attackTypes[3],attackTypes[4],attackTypes[5],attackTypes[6],attackTypes[7],attackTypes[8],"Group"])
years = range(1970,2017)
for year in years:
#year = years[0]
#split it all into groups per year
    dataForYear = data_needed[data_needed["Year"]==year]
    if(len(dataForYear)!=0):     
        group1_name = dataForYear["Group"].value_counts().index[0]
        data_year_group1 = dataForYear[dataForYear["Group"]==group1_name]
        group2_name = dataForYear["Group"].value_counts().index[1]
        data_year_group2 = dataForYear[dataForYear["Group"]==group2_name]
        group3_name = dataForYear["Group"].value_counts().index[2]
        data_year_group3 = dataForYear[dataForYear["Group"]==group3_name]
        group4_name = dataForYear["Group"].value_counts().index[3]
        data_year_group4 = dataForYear[dataForYear["Group"]==group4_name]
        #do metrics for this year, concat into dataframe
        groupall_row = makeRowForGroup(dataForYear,year,attackTypes)
        groupall_row[-1] = "All"
        group1_row = makeRowForGroup(data_year_group1,year,attackTypes)
        group2_row = makeRowForGroup(data_year_group2,year,attackTypes)
        group3_row = makeRowForGroup(data_year_group3,year,attackTypes)
        group4_row = makeRowForGroup(data_year_group4,year,attackTypes)
        dataframe_forYear = pd.DataFrame([groupall_row,group1_row,group2_row,group3_row,group4_row],columns = ["Year","Attacks",attackTypes[0],attackTypes[1],attackTypes[2],attackTypes[3],attackTypes[4],attackTypes[5],attackTypes[6],attackTypes[7],attackTypes[8],"Group"])
    else:
        groupnan_row = np.array([year,0,0,0,0,0,0,0,0,0,0,"No_attacks"])
        dataframe_forYear = pd.DataFrame([groupnan_row,groupnan_row,groupnan_row,groupnan_row,groupnan_row],columns = ["Year","Attacks",attackTypes[0],attackTypes[1],attackTypes[2],attackTypes[3],attackTypes[4],attackTypes[5],attackTypes[6],attackTypes[7],attackTypes[8],"Group"])

    #merge and repeat
    finalDf = finalDf.append(dataframe_forYear)

finalDf.to_csv("data_breakdown.csv",index = False)