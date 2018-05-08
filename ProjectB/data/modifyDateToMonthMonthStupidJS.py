
import pandas as pd
import numpy as np
import seaborn as sns
from utilsFinal import makeRowForGroup
terrorEU=pd.read_csv('terror_EU_processed_data.csv',encoding='latin-1')
df = terrorEU["Date"].copy()
df.loc[:] = "/"
terrorEU["Victims"] = terrorEU["Victims"].fillna(0)
terrorEU["Killed"] = terrorEU["Killed"].fillna(0)

terrorEU["DateStupidJS"] = terrorEU["Month"].astype(str)+df+terrorEU["Day"].astype(str)+df+terrorEU["Month"].astype(str)
terrorEU.to_csv("terror_EU_processed_data_stupidDate.csv")