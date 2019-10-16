const router = require('express').Router();
const jwt = require('jsonwebtoken')

const Users = require('./users-model.js');
const restricted = require('../auth/restricted-middleware.js');
const checkRole = require('../auth/check-role-middleware.js');

router.get('/', restricted, checkRole('mero mero'), (req, res) => {
  Users.find()
    .then(users => {
      res.json({ loggedInUser: req.username, users });
    })
    .catch(err => res.send(err));
});

router.post('/register', (req, res) => {
    let user = req.body;
    const hash = bcrypt.hashSync(user.password, 10); // 2 ^ n
    user.password = hash;
  
    Users.add(user)
      .then(saved => {
        res.status(201).json(saved);
      })
      .catch(error => {
        res.status(500).json({ message: 'cannot add the user', error });
      });
});

router.post('/login',(req,res) => {
    const { username, password } = req.body;

    Users.findBy(username)
        .first()
        .then(user => {
            if(user && bcrypt.compareSync(password, user.password)){
                const token = generateToken(user);

                res.status(200).json(token)
            } else {
                res.status(401).json({ message: "Invalid credentials." })
            }
        })
        .catch(error => {
            res.status(500).json({ error:"Failed connection."})
        })
})

function generateToken(user) {
    const payload = {
      username: user.username,
      subject: user.id,
      role: user.role,
    };

    const options = {
        expiresIn: '1h',
    };
    
    return jwt.sign(payload, secrets.jwtSecret, options);
}

module.exports = router;