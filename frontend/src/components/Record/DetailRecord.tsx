'use client';

import {useState} from 'react';

import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import {UserType} from '@/types/UserContext';
import RecordTable from '@/components/Record/RecordTable';
import TabPanel from '@/components/Record/TabPanel';

function tabYprops(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function DetailRecord({user_info}: {user_info: UserType}) {
  const [tabValue, setTabValue] = useState<number>(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <>
      <Box sx={{width: '100%'}}>
        <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
          <Tabs
            value={tabValue}
            onChange={handleChange}
            aria-label="user game records"
            variant="fullWidth"
          >
            <Tab label="일반 게임" {...tabYprops(0)} />
            <Tab label="랭크 게임" {...tabYprops(1)} />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <RecordTable intraId={user_info.id} type="normal" />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <RecordTable intraId={user_info.id} type="rank" />
        </TabPanel>
      </Box>
    </>
  );
}

export default DetailRecord;
