# -*- coding: utf-8 -*-
"""
Created on Fri Mar  9 10:58:26 2018

@author: Georg
"""

import pandas as pd
import datetime
import numpy as np
import os

os.getcwd()

df = pd.read_csv('murder_data_2016.csv')

#drop entire collumns
df = df.drop(["OFNS_DESC"], axis=1)

#change order of cols
df = df[["Longitude","Latitude","CMPLNT_FR_TM","CMPLNT_FR_DT","LOC_OF_OCCUR_DESC"]]

df["LOC_OF_OCCUR_DESC"] = df["LOC_OF_OCCUR_DESC"].astype(str)
df.info()
df["Longitude"]=df["Longitude"].fillna(0)
df["Latitude"]=df["Latitude"].fillna(0)

#morph datetime cols
hour =  pd.to_datetime(df['CMPLNT_FR_TM'], format='%H:%M:%S')
hour = hour.dt.hour
df["Full_Time"] = df["CMPLNT_FR_TM"]
df["CMPLNT_FR_TM"] = hour

df = df.rename(columns={"CMPLNT_FR_TM": "Hour", "CMPLNT_FR_DT": "Date", "LOC_OF_OCCUR_DESC":"Location"})


df.to_csv('murder_data_processed.csv',index = False)
