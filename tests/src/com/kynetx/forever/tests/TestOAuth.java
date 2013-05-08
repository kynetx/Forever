package com.kynetx.forever.tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

public class TestOAuth {

	private WebDriver driver;
	private String baseUrl;
	private int timeout = 60; // Timeout in seconds
	private StringBuffer verificationErrors = new StringBuffer();

	@Before
	public void setUp() throws Exception {
		System.setProperty("webdriver.chrome.driver", "/home/jessie/libs/bin/chromedriver");
		driver = new FirefoxDriver();
		baseUrl = "http://forevr.us/";
		//driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
	}

	@Test
	public void testLogin() throws Exception {
		WebDriverWait wait = new WebDriverWait(driver, timeout);
		
		String userEmail = "cloudos_test0@kynetx.com";
		String userPassword = "fizzbazz";
		driver.get(baseUrl + "/");
		
		// First things first, let's make sure we're not currently logged in
		if(isElementVisible(By.linkText("Logout"))){
			driver.findElement(By.linkText("Logout")).click();
			waitForElementVisible(By.linkText("Click here to Link Squaretag"));
		}
		
		// Now let's go ahead and start the OAuth process
		By linkLink = By.linkText("Click here to Link Squaretag");
		assertTrue(isElementVisible(linkLink));
		driver.findElement(linkLink).click();
		
		// Make sure that the page asking you to auth is displayed
		By goToLoginLink = By.linkText("I have a SquareTag account");
		wait.until(ExpectedConditions.elementToBeClickable(goToLoginLink));
		
		// Does the login link look correct?
		String loginShouldBeURL =  "https://squaretag.com/oauth.html#!/login?next=/app/b177052x7/oauth_authorize&developer_eci=E3D243D4-B28B-11E2-A01C-1615FE2E5C38";
		String loginLinkHref = driver.findElement(goToLoginLink).getAttribute("href");
		assertTrue(loginLinkHref.startsWith(loginShouldBeURL));
		
		
		// Let's go ahead and show the log in form
		driver.findElement(goToLoginLink).click();
		By loginLink = By.cssSelector("button.btn-primary");
		wait.until(ExpectedConditions.elementToBeClickable(loginLink));
		
		// Enter our username and password...		
		driver.findElement(By.id("loginEmail")).sendKeys(userEmail);
		driver.findElement(By.id("loginPassword")).sendKeys(userPassword);
		
		// Login!
		driver.findElement(loginLink).click();
		
		
		// Does the authorize app page appear?
		By authorizeLink = By.cssSelector("#cloudAppPanel-b177052x7-content a.btn-primary");
		wait.until(ExpectedConditions.elementToBeClickable(authorizeLink));

		assertEquals("Forever", driver.findElement(By.cssSelector("div.media .media-body h4")).getText());
		
		// Does the authorize link look correct?
		String authorizeShouldBeURL =  "https://squaretag.com/oauth.html#!/app/b177052x7/authAccept&developer_eci=E3D243D4-B28B-11E2-A01C-1615FE2E5C38";
		String authorizeLinkHref = driver.findElement(authorizeLink).getAttribute("href");
		assertTrue(authorizeLinkHref.startsWith(authorizeShouldBeURL));
		
		// Go ahead and authorize the app now
		driver.findElement(authorizeLink).click();
		
		// Wait for Forever to load back up.
		By linkedSuccessfulMessage = By.cssSelector("#view-home-auth h3");
		wait.until(ExpectedConditions.visibilityOfElementLocated((linkedSuccessfulMessage)));
		
		// Ensure the message is correct (implies that the linking worked)
		assertEquals("Forever is linked to your personal cloud", driver.findElement(linkedSuccessfulMessage).getText());
		
		// Open up the menu...
		driver.findElement(By.cssSelector("div.navbar-inner .container-fluid button.btn")).click();
		driver.findElement(By.linkText("Profile")).click();
		
		// Wait for profile to load...
		By profileName = By.id("myProfileName");
		wait.until(ExpectedConditions.visibilityOfElementLocated(profileName));
		
		assertEquals("Bob Smith", driver.findElement(profileName).getAttribute("value"));
		
	}

	@After
	public void tearDown() throws Exception {
		driver.quit();
		String verificationErrorString = verificationErrors.toString();
		if (!"".equals(verificationErrorString)) {
			fail(verificationErrorString);
		}
	}

	private boolean isElementPresent(By by) {
		try {
			driver.findElement(by);
			return true;
		} catch (NoSuchElementException e) {
			return false;
		}
	}

	private boolean isElementVisible(By by){
		if(!isElementPresent(by)){
			return false;
		}
		return driver.findElement(by).isDisplayed();
	}
	
	private void waitForElementVisible(By by) throws InterruptedException{ 
		for (int second = 0;; second++) {
			if (second >= timeout) fail("timeout");
			try {
				if (driver.findElement(by).isDisplayed()) break;
			} catch (Exception e) {
				// Empty on purpose. We should wait for a while until we timeout
			}
			Thread.sleep(1000);
		}
	}
}