import PageContainer from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <PageContainer>
      <div className='space-y-4 max-w-3xl'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>About OilBurnTracker</h1>
          <p className='text-muted-foreground text-sm'>
            Open-source geopolitical fire detection and emissions monitoring.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>What is this?</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground space-y-3'>
            <p>
              OilBurnTracker combines real-time satellite fire detection with facility identification
              and emissions estimates to monitor conflict-affected oil and gas infrastructure.
            </p>
            <p>
              Individual pieces of this puzzle exist separately — NASA FIRMS provides fire data,
              Climate TRACE tracks emissions, and various OSINT tools track facility damage. Nobody
              has combined them into a single, free, open-source dashboard until now.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Sources</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground space-y-2'>
            <p><strong>Satellite Fire Detection:</strong> NASA FIRMS (Fire Information for Resource Management System) — VIIRS instrument on Suomi NPP satellite, ~375m resolution, updated every ~3 hours.</p>
            <p><strong>Base Map:</strong> Mapbox satellite imagery with street labels.</p>
            <p><strong>Facility Database:</strong> Curated list of major Middle East oil & gas facilities compiled from public sources.</p>
            <p><strong>Emissions Model:</strong> FRP-to-CO₂ conversion using facility-type-specific multipliers. These are rough estimates, not precise measurements.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Methodology & Limitations</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground space-y-2'>
            <p>Fire Radiative Power (FRP) is measured by satellite in megawatts. We convert FRP to estimated CO₂ emissions using published conversion factors that vary by facility type.</p>
            <p><strong>Limitations:</strong></p>
            <ul className='list-disc pl-5 space-y-1'>
              <li>Satellites pass overhead every ~3 hours — fires between passes are missed</li>
              <li>Cloud cover blocks detection</li>
              <li>Small fires below detection threshold are not captured</li>
              <li>CO₂ estimates are order-of-magnitude approximations</li>
              <li>Facility matching uses proximity only — may produce false positives</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Open Source</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground space-y-2'>
            <p>
              OilBurnTracker is MIT licensed. Contributions welcome.
            </p>
            <p>
              <a href='https://github.com/oilburntracker/oilburntracker' target='_blank' rel='noopener noreferrer' className='text-primary underline'>
                GitHub Repository
              </a>
            </p>
          </CardContent>
        </Card>

        <Card id='terms'>
          <CardHeader>
            <CardTitle>Terms of Use</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground space-y-3'>
            <p>By using OilBurnTracker you agree to the following terms:</p>
            <ul className='list-disc pl-5 space-y-1.5'>
              <li><strong>Informational purposes only.</strong> This site provides conflict monitoring data for public awareness and educational purposes. It is not intended as the basis for investment, military, or policy decisions.</li>
              <li><strong>No warranty.</strong> Data is compiled from public sources and may contain errors, delays, or omissions. We make no guarantee of accuracy, completeness, or timeliness.</li>
              <li><strong>Third-party content.</strong> Embedded videos are served via YouTube&apos;s official embed player and are subject to YouTube&apos;s Terms of Service. News article links direct to their original publishers. We do not reproduce copyrighted content.</li>
              <li><strong>Fair use.</strong> Short factual descriptions of news events constitute fair use for public interest reporting. Source attribution is provided for all claims.</li>
              <li><strong>No affiliation.</strong> OilBurnTracker is not affiliated with NASA, any government, energy company, or news organization.</li>
              <li><strong>User conduct.</strong> Do not use this tool to incite violence, harass individuals, or violate any applicable law.</li>
            </ul>
          </CardContent>
        </Card>

        <Card id='privacy'>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className='text-sm text-muted-foreground space-y-3'>
            <p><strong>We collect no personal data.</strong></p>
            <ul className='list-disc pl-5 space-y-1.5'>
              <li>No cookies, no tracking pixels, no analytics scripts.</li>
              <li>No account creation or login required.</li>
              <li>No data is stored about your visit on our servers.</li>
              <li>The FIRMS API proxy passes your request to NASA servers — NASA&apos;s own privacy policy applies to that data.</li>
              <li>Embedded YouTube videos are loaded from YouTube&apos;s privacy-enhanced mode (youtube-nocookie.com), which limits tracking. YouTube&apos;s privacy policy applies to video playback.</li>
              <li>This site is hosted on Cloudflare Pages. Cloudflare may collect minimal access logs per their privacy policy.</li>
            </ul>
            <p className='text-xs text-muted-foreground/70 mt-2'>Last updated: March 2026</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
