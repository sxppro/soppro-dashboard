import {
  Card,
  Col,
  Grid,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@tremor/react';
import Categories from './Categories';
import MainMetrics from './MainMetrics';
import Monthly from './Monthly';

const BasicDashboard = () => {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
      <TabGroup>
        <TabList>
          <Tab>Month to Date</Tab>
          <Tab>Year to Date</Tab>
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
    </>
  );
};

export default BasicDashboard;
