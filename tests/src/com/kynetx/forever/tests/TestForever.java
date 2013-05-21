package com.kynetx.forever.tests;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.fail;

import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.FixMethodOrder;
import org.junit.Test;
import org.junit.runners.MethodSorters;
import org.openqa.selenium.By;
import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class TestForever {

	private static WebDriver driver;
	private static WebDriverWait wait;
	private static String baseUrl = "http://forevr.us/";
	private static String squareTagUrl = "https://squaretag.com/app.html";
	private static int timeout = 60; // Timeout in seconds
	private static StringBuffer verificationErrors = new StringBuffer();

	private static int friends;
	
	@BeforeClass
	public static void setUp() throws Exception {
		System.setProperty("webdriver.chrome.driver", "/home/jessie/libs/bin/chromedriver");
		driver = new ChromeDriver();
		wait = new WebDriverWait(driver, timeout);
		//driver.manage().timeouts().implicitlyWait(30, TimeUnit.SECONDS);
	}

	@Test
	public void test00OAuth() throws Exception {
		
		String userEmail = "cloudos_test0@kynetx.com";
		String userPassword = "fizzbazz";
		driver.get(baseUrl);
		
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
	}
	
	@Test
	public void test10Profile() throws Exception {
		// Open up the menu...
		driver.findElement(By.cssSelector("div.navbar-inner .container-fluid button.btn")).click();
		driver.findElement(By.linkText("Profile")).click();
		
		// Wait for profile to load...
		By profileName = By.cssSelector("input[name=myProfileName]");
		wait.until(ExpectedConditions.visibilityOfElementLocated(profileName));
		
		assertEquals("Bob Smith", driver.findElement(profileName).getAttribute("value"));
		
		// Modify and save the field
		driver.findElement(profileName).sendKeys(" Test");
		driver.findElement(By.cssSelector("#view-profile form button[type=submit]")).click();
		
		// Wait until we get a response
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("alert-profile-success")));
		
		// Go to SquareTag
		driver.get(squareTagUrl);
		
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("navAvatar")));
		
		// Open up the profile page on SquareTag
		driver.findElement(By.id("navAvatar")).click();
		driver.findElement(By.cssSelector("div.navbar-inner ul.dropdown-menu a")).click();
		
		// Wait for it to load...
		wait.until(ExpectedConditions.visibilityOfElementLocated(profileName));
		
		// Check to make sure adding the " Test" to the profile name worked
		assertEquals("Bob Smith Test", driver.findElement(profileName).getAttribute("value"));
		
		// Modify and save the field
		driver.findElement(profileName).clear();
		driver.findElement(profileName).sendKeys("Bob Smith");
		driver.findElement(By.cssSelector("#cloudAppPanel-a169x672-content form button[type=submit]")).click();
		
		// Wait until we get a response
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("#cloudAppPanel-a169x672-content div.alert.alert-success")));
		
		// Check if our changes in SquareTag show up in Forever
		driver.get(baseUrl);
		
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("view-friends")));
		
		// Open up the menu...
		driver.findElement(By.cssSelector("div.navbar-inner .container-fluid button.btn")).click();
		driver.findElement(By.linkText("Profile")).click();
		
		// Wait for profile to load...
		wait.until(ExpectedConditions.visibilityOfElementLocated(profileName));
		
		assertEquals("Bob Smith", driver.findElement(profileName).getAttribute("value"));
	}
	
	@Test
	public void test20ExistingFriends() throws Exception {
		driver.get(baseUrl);
				
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("#table-friends")));
		
		friends = driver.findElements(By.cssSelector("#table-friends>tr")).size();
		
		WebElement firstFriend = driver.findElement(By.cssSelector("#table-friends>tr:nth-of-type(1)>td"));
		assertEquals("Steve Fulling", firstFriend.getText());
		
		firstFriend.click();
		
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("friend-name")));
		
		assertEquals("Steve Fulling", driver.findElement(By.cssSelector("#view-friend #friend-name")).getText());
		assertEquals("swf@kynetx.com", driver.findElement(By.cssSelector("#view-friend #friend-email")).getText());
		assertEquals("8016023200", driver.findElement(By.cssSelector("#view-friend #friend-phone")).getText());
	}

	
	@Test
	public void test30Invitation() throws Exception {
		driver.get(baseUrl + "?invite=52dfa6268621d5b13f3cc8560ae00be0");
		
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("hostess-name")));
		
		assertEquals("Jessie A. Morris", driver.findElement(By.id("hostess-name")).getText());
		assertEquals("jessie@jessieamorris.com", driver.findElement(By.id("hostess-email")).getText());
		assertEquals("801-210-1526", driver.findElement(By.id("hostess-phone")).getText());
		
		driver.findElement(By.id("btn-invitation-accept")).click();
		
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("#table-friends")));
		
		int friendsAfterAcceptance = driver.findElements(By.cssSelector("#table-friends>tr")).size();
		assertEquals(friends + 1, friendsAfterAcceptance);
	}

	
	@Test
	public void test40NewAccount() throws Exception {
		driver.get(squareTagUrl);
		
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("navAvatar")));
		
		driver.findElement(By.id("navAvatar")).click();
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("#navRight ul.dropdown-menu")));
		
		driver.findElement(By.linkText("Logout")).click();
		
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("formLogin")));
		
		driver.get(baseUrl);
		
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("view-friends")));
		
		// Open up the menu and logout
		driver.findElement(By.cssSelector("div.navbar-inner .container-fluid button.btn")).click();
		driver.findElement(By.linkText("Logout")).click();
		
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("Click here to Link Squaretag")));

		// Let's get linking!!
		driver.findElement(By.linkText("Click here to Link Squaretag")).click();
		
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.linkText("I'm a new SquareTag User")));
		
		// Start the create a new account process
		driver.findElement(By.linkText("I'm a new SquareTag User")).click();
	
		long time = System.currentTimeMillis();
		String email = "cloudos_test"+time+"@kynetx.com";
		String password = "fizzbazz";
		
		driver.findElement(By.id("signupEmail")).sendKeys(email);
		driver.findElement(By.id("signupPassword")).sendKeys(password);
		driver.findElement(By.id("confirmPassword")).sendKeys(password);
		
		driver.findElement(By.id("signupSubmit")).click();
		
		By authorizeLink = By.cssSelector("#cloudAppPanel-b177052x7-content a.btn-primary");
		wait.until(ExpectedConditions.visibilityOfElementLocated(authorizeLink));
		driver.findElement(authorizeLink).click();
		
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("view-home-auth")));
		assertEquals("Forever is linked to your personal cloud", driver.findElement(By.cssSelector("#view-home-auth h3")).getText());
	}
	
	@Test
	public void test50NewAccountFriends() throws Exception {
		// Open up the menu...
		driver.findElement(By.cssSelector("div.navbar-inner .container-fluid button.btn")).click();
		// Go to friends list
		driver.findElement(By.linkText("Friends")).click();
		
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.cssSelector("#view-friends")));
		
		assertFalse(isElementPresent(By.cssSelector("#table-friends>tr")));
	}
	

	@AfterClass
	public static void testFixtureTearDown() throws Exception {
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