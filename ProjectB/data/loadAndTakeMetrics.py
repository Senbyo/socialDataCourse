import pandas as pd
import numpy as np
import seaborn as sns

terrorEU=pd.read_csv('terror_EU_processed_data.csv',encoding='latin-1')
features = np.array(np.array(terrorEU.columns).tolist())

terrorEU["AttackType"].value_counts().index
terrorEU["Group"].loc[terrorEU["Year"]==2016].value_counts()
ISIS = terrorEU["Group"].loc[(terrorEU["Group"]=="Islamic State of Iraq and the Levant (ISIL)") |  (terrorEU["Group"]=="Jihadi-inspired extremists")]
ISIS.count()
dataForYear = terrorEU[terrorEU["Year"]>=2014]
dataForYear["Group"].value_counts()