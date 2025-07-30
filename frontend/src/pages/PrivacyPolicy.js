import React, { useEffect, useState, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Divider, 
  List, 
  ListItem, 
  ListItemText, 
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { childrenAPI } from '../api/children';

const PrivacyPolicy = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [policyDialogOpen, setPolicyDialogOpen] = useState(false);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const data = await childrenAPI.getAll();
        setChildren(data);
      } catch (error) {
        setChildren([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, []);

  const handleOpenPolicy = () => {
    setPolicyDialogOpen(true);
  };

  const handleClosePolicy = () => {
    setPolicyDialogOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Account Information
        </Typography>
        <Typography variant="body1" paragraph>
          KidsTube values your privacy. We collect the information necessary to provide a safe and enjoyable experience for children and parents. Your data may be shared with third parties. You can view all information associated with your account below.
        </Typography>
        


        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>
          Your Information
        </Typography>
        {user ? (
          <Box sx={{ mb: 2 }}>
            <Typography><b>Username:</b> {user.username}</Typography>
            <Typography><b>Email:</b> {user.email}</Typography>
            <Typography><b>Name:</b> {user.firstName} {user.lastName}</Typography>
            <Typography><b>User Type:</b> {user.userType || 'parent'}</Typography>
            <Typography><b>Account Active:</b> {user.isActive ? 'Yes' : 'No'}</Typography>
          </Box>
        ) : (
          <Typography>No user information found.</Typography>
        )}
        <Divider sx={{ my: 2 }} />
        <Typography variant="h5" gutterBottom>
          Subprofiles
        </Typography>
        {loading ? (
          <CircularProgress />
        ) : children.length === 0 ? (
          <Typography>No subprofiles found.</Typography>
        ) : (
          <List>
            {children.map(child => (
              <ListItem key={child._id} alignItems="flex-start">
                <ListItemText
                  primary={child.name}
                  secondary={
                    <>
                      <Typography component="span" variant="body2">Gender: {child.gender}</Typography><br />
                      <Typography component="span" variant="body2">Date of Birth: {new Date(child.dateOfBirth).toLocaleDateString()}</Typography><br />
                      <Typography component="span" variant="body2">Active: {child.isActive ? 'Yes' : 'No'}</Typography><br />
                      <Typography component="span" variant="body2">Approved Videos: {child.approvedVideos?.length || 0}</Typography><br />
                      <Typography component="span" variant="body2">Requested Videos: {child.requestedVideos?.length || 0}</Typography>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
        <Divider sx={{ my: 2 }} />
        {/* View Policy Button */}
                <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleOpenPolicy}
          >
            Privacy Policy
          </Button>
        </Box>

        {/* Privacy Policy Dialog */}
        <Dialog 
          open={policyDialogOpen} 
          onClose={handleClosePolicy}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ 
            backgroundColor: '#f3e8ff', 
            color: '#8e44ad',
            fontFamily: '"Comic Sans MS", "Comic Neue", "Baloo", "Arial Rounded MT Bold", "Arial", sans-serif'
          }}>
            🛡️ KidsTube Privacy Policy
          </DialogTitle>

          <DialogContent sx={{ mt: 2, maxHeight: '70vh', overflow: 'auto' }}>
            <Typography variant="body1" paragraph>
              Effective Date: July 15, 2025
            </Typography>
            
            <Typography variant="h6" gutterBottom color="#8e44ad">
              1. Introduction
            </Typography>
            <Typography variant="body1" paragraph>
              KidsTube ("we," "our," or "us") is a video‑streaming platform designed for children under the supervision of their parents or legal guardians (collectively, "parents"). Protecting children's privacy is our highest priority. This Privacy Policy explains how we collect, use, disclose, and safeguard personal information when parents and children use KidsTube and its related services (the "Service"). It also outlines the tools we provide parents to control their child's experience, including the ability to approve or disapprove videos.
            </Typography>

            <Typography variant="h6" gutterBottom color="#8e44ad">
              2. Scope of This Policy
            </Typography>
            <Typography variant="body1" paragraph>
              This Policy applies to all users of KidsTube worldwide. Because KidsTube is primarily directed to children in the United States, we comply with the U.S. Children's Online Privacy Protection Act ("COPPA") and other applicable laws such as the California Consumer Privacy Act ("CCPA") and the EU/UK General Data Protection Regulation ("GDPR").
            </Typography>

            <Typography variant="h6" gutterBottom color="#8e44ad">
              3. Information We Collect
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Category</strong> | <strong>Examples</strong> | <strong>Source</strong>
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Parent Account Information</strong> | Parent's name, email address, password, authentication tokens | Provided by parent during registration
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Child Profile Information</strong> | Child's first name or nickname, birth month & year, avatar, photo ID, selected interests | Provided by parent when creating a child profile
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Parental Settings & Approvals</strong> | Lists of videos a parent has approved or blocked for the child, viewing time limits, content filters | Generated through parent actions
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Usage & Viewing Data</strong> | Watch history, search terms, likes/dislikes, app interactions, crash logs | Collected automatically via app and device
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Device & Technical Data</strong> | IP address, device type, operating system, browser, cookie identifiers, time zone | Collected automatically
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Support Communications</strong> | Messages, attachments, and metadata exchanged with our support team | Provided by parent
            </Typography>
            <Typography variant="body1" paragraph>
              We do not intentionally collect more personal information from a child than is reasonably necessary to participate in KidsTube.
            </Typography>

            <Typography variant="h6" gutterBottom color="#8e44ad">
              4. How We Use Information
            </Typography>
            <Typography variant="body1" paragraph>
              We use personal information to:
            </Typography>
            <Typography variant="body1" paragraph>
              • Provide and maintain the Service (e.g., deliver approved videos, personalize the child interface).
            </Typography>
            <Typography variant="body1" paragraph>
              • Authenticate and secure accounts (e.g., verify parent identity, prevent fraud, detect abuse).
            </Typography>
            <Typography variant="body1" paragraph>
              • Enable parental controls (e.g., store video‑approval lists, enforce viewing limits).
            </Typography>
            <Typography variant="body1" paragraph>
              • Improve KidsTube (e.g., analyze aggregated usage data, fix bugs, develop new child‑friendly features).
            </Typography>
            <Typography variant="body1" paragraph>
              • Communicate with parents (e.g., send confirmations, policy updates, parental notices required by law).
            </Typography>
            <Typography variant="body1" paragraph>
              • Comply with legal obligations (e.g., COPPA verifiable parental consent records, regulatory inquiries).
            </Typography>

            <Typography variant="h6" gutterBottom color="#8e44ad">
              5. Parental Consent & Controls
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>5.1 Verifiable Parental Consent</strong>
            </Typography>
            <Typography variant="body1" paragraph>
              Under COPPA, we obtain verifiable parental consent before collecting a child's personal information during registration.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>5.2 Video Approval Workflow</strong>
            </Typography>
            <Typography variant="body1" paragraph>
              • Parents browse or search the KidsTube catalog and individually approve videos or playlists.
            </Typography>
            <Typography variant="body1" paragraph>
              • Approved items appear in the child's library. Unapproved videos are hidden.
            </Typography>
            <Typography variant="body1" paragraph>
              • Parents can revoke approval at any time; changes take effect immediately on the child's profile.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>5.3 Managing a Child's Information</strong>
            </Typography>
            <Typography variant="body1" paragraph>
              Parents can, at any time:
            </Typography>
            <Typography variant="body1" paragraph>
              • Review their child's personal information and watch history.
            </Typography>
            <Typography variant="body1" paragraph>
              • Update or Correct inaccurate profile details.
            </Typography>
            <Typography variant="body1" paragraph>
              • Delete their child's profile and associated data. To exercise these rights, visit Settings → Child Profiles or contact us (Section 13).
            </Typography>

            <Typography variant="h6" gutterBottom color="#8e44ad">
              6. Sharing & Disclosure
            </Typography>
            <Typography variant="body1" paragraph>
              We limit disclosure of personal information as follows:
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Service Providers</strong> – We share information with vetted vendors (e.g., cloud hosting, analytics, customer support) under strict confidentiality agreements.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Legal Compliance</strong> – We may disclose information if required by law, court order, or to protect the rights, safety, or property of KidsTube, its users, or others.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Business Transfers</strong> – If KidsTube is involved in a merger, acquisition, or asset sale, we will provide notice before personal information is transferred.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Aggregated/De‑Identified Data</strong> – We may share statistics that do not identify any individual. We do not sell or rent personal information, including children's data.
            </Typography>

            <Typography variant="h6" gutterBottom color="#8e44ad">
              7. Cookies & Similar Technologies
            </Typography>
            <Typography variant="body1" paragraph>
              We use only strictly necessary and analytic cookies to operate the Service, prevent fraud, remember login status, and understand aggregate usage. Parents can manage cookies in their browser settings; disabling cookies may impair functionality.
            </Typography>

            <Typography variant="h6" gutterBottom color="#8e44ad">
              8. Security
            </Typography>
            <Typography variant="body1" paragraph>
              We employ administrative, technical, and physical safeguards designed to protect personal information, including:
            </Typography>
            <Typography variant="body1" paragraph>
              • Encryption in transit (TLS 1.2+) and at rest.
            </Typography>
            <Typography variant="body1" paragraph>
              • Role‑based access controls and two‑factor authentication for staff.
            </Typography>
            <Typography variant="body1" paragraph>
              • Regular security audits, penetration tests, and vulnerability scanning.
            </Typography>
            <Typography variant="body1" paragraph>
              However, no system is 100% secure. If we discover a security breach involving personal information, we will notify affected parents as required by applicable law.
            </Typography>

            <Typography variant="h6" gutterBottom color="#8e44ad">
              9. Data Retention
            </Typography>
            <Typography variant="body1" paragraph>
              We retain personal information only for as long as necessary to fulfill the purposes described in this Policy, unless a longer retention period is required by law. If a parent deletes a child profile or requests account deletion, we erase personal information within 30 days, except for legal compliance records (e.g., COPPA consent) which we retain for up to 5 years.
            </Typography>

            <Typography variant="h6" gutterBottom color="#8e44ad">
              10. International Transfers
            </Typography>
            <Typography variant="body1" paragraph>
              KidsTube's servers are currently located in the United States. If you access the Service from outside the U.S., your information will be transferred to, stored, and processed in the U.S. We rely on appropriate safeguards, such as Standard Contractual Clauses, where required.
            </Typography>

            <Typography variant="h6" gutterBottom color="#8e44ad">
              11. Your Rights and Choices
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Parents</strong> – COPPA rights to review, delete, or refuse further collection of child data.
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>EU/UK Users</strong> – GDPR rights to access, rectify, erase, restrict, object, or port data and lodge a complaint with a supervisory authority. Our legal basis for processing includes consent (for child data), contract (to provide the Service), and legitimate interests (to improve KidsTube).
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>California Residents</strong> – CCPA rights to know, delete, and opt out of the sale of personal information (KidsTube does not sell personal information). We will not discriminate against you for exercising any privacy rights.
            </Typography>

            <Typography variant="h6" gutterBottom color="#8e44ad">
              12. Changes to This Policy
            </Typography>
            <Typography variant="body1" paragraph>
              We may update this Privacy Policy from time to time. We will post the updated version on this page and notify parents via email or in‑app notice at least 30 days before material changes take effect. Continued use of KidsTube after the effective date constitutes acceptance of the revised Policy.
            </Typography>

            <Typography variant="h6" gutterBottom color="#8e44ad">
              13. Contact Us
            </Typography>
            <Typography variant="body1" paragraph>
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>KidsTube Privacy Team</strong><br />
              5000 Forbes Ave<br />
              Pittsburgh, PA 15213 USA<br />
              Email: privacy@kidstube.com<br />
              Phone: +1 (800) 555‑KIDS
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={handleClosePolicy} 
              variant="contained"
              sx={{ 
                backgroundColor: '#8e44ad',
                '&:hover': {
                  backgroundColor: '#7d3c98'
                }
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
        
      </Paper>
    </Box>
  );
};

export default PrivacyPolicy; 