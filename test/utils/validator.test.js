import { passwordValidator, emailValidator, instagramValidator, facebookValidator, websiteValidator } from '~/utils/validator'

/*

http://255.255.255.255
255.255.255.255
http://invalid.com/perl.cgi?key= | http://web-site.com/cgi-bin/perl.cgi?key1=value1&key2
http://www.site.com:8008
*/

describe('website validation', () => {
    test('valid website with https+www', () => {
        const valid = websiteValidator.test('https://www.example.com')
        expect(valid).toBe(true)
    })

    test('valid website with http+www', () => {
        const valid = websiteValidator.test('http://www.example.com')
        expect(valid).toBe(true)
    })

    test('valid website without http+www', () => {
        const valid = websiteValidator.test('example.com')
        expect(valid).toBe(true)
    })

    test('valid website with subdomain', () => {
        const valid = websiteValidator.test('yeet.example.com')
        expect(valid).toBe(true)
    })

    test('valid website with path', () => {
        const valid = websiteValidator.test('http://www.example.com/product')
        expect(valid).toBe(true)
    })

    test('valid website with query', () => {
        const valid = websiteValidator.test('http://www.example.com/products?id=1&page=2')
        expect(valid).toBe(true)
    })

    test('valid website with link', () => {
        const valid = websiteValidator.test('http://www.example.com#up')
        expect(valid).toBe(true)
    })

    test('valid website with ip', () => {
        const valid = websiteValidator.test('127.0.0.1')
        expect(valid).toBe(true)
    })

    test('valid website with http+ip', () => {
        const valid = websiteValidator.test('http://127.0.0.1')
        expect(valid).toBe(true)
    })

    test('valid website with ip+port', () => {
        const valid = websiteValidator.test('http://127.0.0.1:8080')
        expect(valid).toBe(true)
    })

    test('missing tld', () => {
        const valid = websiteValidator.test('http://what')
        expect(valid).toBe(false)
    })

    test('illegal chars', () => {
        const valid = websiteValidator.test('http://what.com!')
        expect(valid).toBe(true)
    })
})

describe('instagram validation', () => {

    test('valid instagram with https+www', () => {
        const valid = instagramValidator.test('https://www.instagram.com/meinladen')
        expect(valid).toBe(true)
    })

    test('valid instagram with hhttp://www.example.com#upttp+www', () => {
        const valid = instagramValidator.test('http://www.instagram.com/meinladen')
        expect(valid).toBe(true)
    })

    test('valid instagram with https', () => {
        const valid = instagramValidator.test('https://instagram.com/meinladen')
        expect(valid).toBe(true)
    })

    test('valid instagram with www', () => {
        const valid = instagramValidator.test('www.instagram.com/meinladen')
        expect(valid).toBe(true)
    })

    test('valid instagram with http', () => {
        const valid = instagramValidator.test('http://instagram.com/meinladen')
        expect(valid).toBe(true)
    })

    test('missing name', () => {
        const valid = instagramValidator.test('https://instagram.com/')
        expect(valid).toBe(false)
    })

    test('wrong domain', () => {
        const valid = instagramValidator.test('https://instagrram.com/meinladen')
        expect(valid).toBe(false)
    })

    test('with subdomain', () => {
        const valid = instagramValidator.test('https://weird.instagram.com/meinladen')
        expect(valid).toBe(false)
    })

    test('with query parameter', () => {
        const valid = instagramValidator.test('https://instagram.com/meinladen?token=123')
        expect(valid).toBe(false)
    })

    test('with wrong tld', () => {
        const valid = instagramValidator.test('https://instagram.de/meinladen')
        expect(valid).toBe(false)
    })

})

describe('facebook validation', () => {

    test('valid facebook with https+www', () => {
        const valid = facebookValidator.test('https://www.facebook.com/meinladen')
        expect(valid).toBe(true)
    })

    test('valid facebook with http+www', () => {
        const valid = facebookValidator.test('http://www.facebook.com/meinladen')
        expect(valid).toBe(true)
    })

    test('valid facebook with https', () => {
        const valid = facebookValidator.test('https://facebook.com/meinladen')
        expect(valid).toBe(true)
    })

    test('valid facebook with www', () => {
        const valid = facebookValidator.test('www.facebook.com/meinladen')
        expect(valid).toBe(true)
    })

    test('valid facebook with http', () => {
        const valid = facebookValidator.test('http://facebook.com/meinladen')
        expect(valid).toBe(true)
    })

    test('missing name', () => {
        const valid = facebookValidator.test('https://facebook.com/')
        expect(valid).toBe(false)
    })

    test('wrong domain', () => {
        const valid = facebookValidator.test('https://instagrram.com/meinladen')
        expect(valid).toBe(false)
    })

    test('with subdomain', () => {
        const valid = facebookValidator.test('https://weird.facebook.com/meinladen')
        expect(valid).toBe(false)
    })

    test('with query parameter', () => {
        const valid = facebookValidator.test('https://facebook.com/meinladen?token=123')
        expect(valid).toBe(false)
    })

    test('with wrong tld', () => {
        const valid = facebookValidator.test('https://facebook.de/meinladen')
        expect(valid).toBe(false)
    })

})

describe('email validation', () => {

    test('valid email', () => {
        const valid = emailValidator.test('hi@wasgehtab.com')
        expect(valid).toBe(true)
    })

    test('missing @', () => {
        const valid = emailValidator.test('hiwasgehtab.com')
        expect(valid).toBe(false)
    })

    test('missing tld', () => {
        const valid = emailValidator.test('hi@wasgehtab')
        expect(valid).toBe(false)
    })

    test('multiple @', () => {
        const valid = emailValidator.test('hi@wasgehtab@lol.com')
        expect(valid).toBe(false)
    })

    test('missing part before @', () => {
        const valid = emailValidator.test('@wasgehtablol.com')
        expect(valid).toBe(false)
    })

    test('missing part after @', () => {
        const valid = emailValidator.test('hi@')
        expect(valid).toBe(false)
    })

    test('valid with subdomain', () => {
        const valid = emailValidator.test('hi@what.ever.com')
        expect(valid).toBe(true)
    })

    test('invalid with path', () => {
        const valid = emailValidator.test('hi@whatever.com/ok')
        expect(valid).toBe(false)
    })

    test('invalid char', () => {
        const valid = emailValidator.test('hi@what?ever.com')
        expect(valid).toBe(false)
    })

})

describe('password validation', () => {

    test('valid password', () => {
        const valid = passwordValidator.test('GutesPasswort123?!')
        expect(valid).toBe(true)
    })

    test('missing special chars', () => {
        const valid = passwordValidator.test('GutesPasswort123')
        expect(valid).toBe(false)
    })

    test('missing length', () => {
        const valid = passwordValidator.test('Meh?!14')
        expect(valid).toBe(false)
    })

    test('missing uppercase', () => {
        const valid = passwordValidator.test('gutespasswort123?!')
        expect(valid).toBe(false)
    })

    test('missing lowercase', () => {
        const valid = passwordValidator.test('GUTESPASSWORT123?!')
        expect(valid).toBe(false)
    })

    test('missing number', () => {
        const valid = passwordValidator.test('GutesPasswort?!')
        expect(valid).toBe(false)
    })
    
})