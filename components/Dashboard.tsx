'use client';

import {
  Card,
  Col,
  Flex,
  Grid,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
  Text,
  Title,
} from '@tremor/react';
import Categories from './Categories';
import MainMetrics from './MainMetrics';
import Monthly from './Monthly';
import SignOut from './layout/SignOut';

const Dashboard = () => {
  return (
    <main className="max-w-screen-2xl m-auto py-4 px-4 md:px-8">
      <Flex justifyContent="between">
        <Title>Dashboard</Title>
        <SignOut />
      </Flex>
      <Text>Description</Text>

      <TabGroup className="mt-6">
        <TabList>
          <Tab>Monthly Recap</Tab>
          <Tab>Transactions</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <MainMetrics />
            <Grid numItemsMd={2} numItemsLg={3} className="gap-6 mt-6">
              <Col numColSpanMd={1} numColSpanLg={2}>
                <Monthly />
              </Col>
              <Col numColSpanMd={1}>
                <Categories />
              </Col>
            </Grid>
          </TabPanel>
          <TabPanel>
            <div className="mt-6">
              <Card>
                <div className="h-96" />
              </Card>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </main>
  );
};

export default Dashboard;
