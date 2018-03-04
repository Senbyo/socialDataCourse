# -*- coding: utf-8 -*-
"""
Created on Fri Mar  2 11:26:48 2018

@author: Georg
"""


import pandas as pd
import datetime
import numpy as np

df = pd.read_csv("NYdata.csv")
df = df.iloc[:,:-7] #remove 

df["PD_DESC"].value_counts()

df["PD_DESC"] = df["PD_DESC"].astype(str)

dPure = df["PD_DESC"]
ds = dPure.str.replace('\d+', '')
#ds = ds.str.replace(',', '_')
ds = ds.str.replace(' ', '_')
ds = ds.map(lambda val: val.split(",", 1)[0])
ds = ds.str.rstrip("_")
dataFrequences = ds.value_counts()
dataFrequences= dataFrequences.to_frame()
dataFrequences.to_csv('processed_NYdata.csv',index = True)

tt = df[["CMPLNT_FR_DT","PD_DESC"]] + dataFrequences


dataMonth = df[["CMPLNT_FR_DT","PD_DESC"]]
dataMonth["PD_DESC"] = dataMonth["PD_DESC"].str.replace('\d+', '')
#ds = ds.str.replace(',', '_')
dataMonth["PD_DESC"] = dataMonth["PD_DESC"].str.replace(' ', '_')
dataMonth["PD_DESC"] = dataMonth["PD_DESC"].map(lambda val: val.split(",", 1)[0])
dataMonth["PD_DESC"] = dataMonth["PD_DESC"].str.rstrip("_")
dataMonth['CMPLNT_FR_DT'] = pd.to_datetime(dataMonth['CMPLNT_FR_DT'])
dataMonth['Month'] = pd.DatetimeIndex(df['CMPLNT_FR_DT']).month


dataTopFive = dataMonth.loc[(dataMonth["PD_DESC"] == "LARCENY") | (dataMonth["PD_DESC"] == "HARASSMENT") | (dataMonth["PD_DESC"] == "ASSAULT") | (dataMonth["PD_DESC"] == "MARIJUANA") | (dataMonth["PD_DESC"] == "MISCHIEF")]
dataTopFive = dataTopFive[["Month","PD_DESC"]]
dataTopFive = dataTopFive.sort_values(["Month","PD_DESC"],ascending = [1,1])
dataTopFive = dataTopFive.reset_index(drop = True)

#store all incidents for first 5 in one dataframe
dataOnMonths = pd.DataFrame()
for i in range(12):
    dat = dataTopFive.loc[dataTopFive["Month"]==i+1]
    dataOnMonths = dataOnMonths.append( dat["PD_DESC"].value_counts(), ignore_index = True)

dataOnMonths.to_csv('incident_data_perMonth.csv',index = True)
