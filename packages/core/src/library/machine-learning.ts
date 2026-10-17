import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const r = String.raw
const py = (...lines: string[]) => code('python', ...lines)

const CARDS: CardContent[] = [
  // The basics
  {
    front: 'Supervised vs unsupervised learning',
    back: 'Supervised learning trains on labeled examples (inputs with known answers) to predict labels for new inputs; unsupervised learning finds structure, such as clusters, in unlabeled data',
  },
  {
    front: 'Classification vs regression',
    back: 'Classification predicts a category (spam or not spam); regression predicts a continuous number (a house price)',
  },
  {
    front: 'Reinforcement learning',
    back: 'An agent learns by taking actions in an environment and receiving rewards, aiming to maximize its total reward over time',
    extra: 'Used for game-playing agents, robotics, and fine-tuning language models from human feedback (RLHF).',
  },
  {
    front: 'Features and labels',
    back: 'Features are the input variables a model uses; the label (or target) is the value it learns to predict',
    extra: 'Predicting house prices: size and location are features, the sale price is the label.',
  },
  {
    front: 'Parameters vs hyperparameters',
    back: 'Parameters, such as weights, are learned from the data during training; hyperparameters (learning rate, tree depth, k in k-NN) are set before training and tuned on validation data',
  },
  // Splitting data
  {
    front: 'Train, validation and test sets',
    back: 'The training set fits the model, the validation set guides tuning and model selection, and the test set gives a final, unbiased estimate of performance on unseen data',
    extra: 'Common splits are 70/15/15 or 80/10/10; cross-validation can replace a fixed validation set.',
  },
  {
    front: 'Why keep the test set untouched until the end?',
    back: 'Every decision made by looking at test scores leaks information into the model, so the test score becomes optimistic and no longer predicts real-world performance',
  },
  {
    front: 'Split data 80/20 in scikit-learn, keeping class proportions',
    back: py(
      'from sklearn.model_selection import train_test_split',
      '',
      'X_train, X_test, y_train, y_test = train_test_split(',
      '    X, y, test_size=0.2, stratify=y, random_state=42',
      ')',
    ),
    extra: '`stratify=y` keeps the same class balance in both sets; `random_state` makes the split reproducible.',
  },
  {
    front: 'Data leakage',
    back: 'Information that wouldn’t be available at prediction time sneaks into training, so validation scores look far better than real performance',
    extra:
      'Examples: fitting a scaler on the full dataset before splitting, a feature computed from the target, or random splits of time-series data that let the model see the future.',
  },
  {
    front: 'Scale features without leaking validation data into training',
    back: py(
      'from sklearn.pipeline import make_pipeline',
      'from sklearn.preprocessing import StandardScaler',
      'from sklearn.linear_model import LogisticRegression',
      '',
      'model = make_pipeline(StandardScaler(), LogisticRegression())',
      'model.fit(X_train, y_train)',
    ),
    extra: 'Inside a pipeline the scaler is fitted only on the training data, or on the training folds during cross-validation.',
  },
  // Overfitting and the bias-variance tradeoff
  {
    front: 'Overfitting',
    back: 'The model memorizes noise and quirks of the training data: training error is low but validation error is much higher',
  },
  {
    front: 'Underfitting',
    back: 'The model is too simple to capture the pattern: error is high on both the training and the validation data',
  },
  {
    front: 'Training accuracy 99%, validation accuracy 72%. Diagnosis?',
    back: 'Overfitting (high variance): the model fits the training data far better than new data',
    extra: 'Try more data, a simpler model, stronger regularization or early stopping.',
  },
  {
    front: 'Bias vs variance',
    back: 'Bias is error from overly simple assumptions (underfitting); variance is error from sensitivity to the particular training sample (overfitting). More complex models usually lower bias but raise variance',
  },
  {
    front: 'Bias-variance decomposition of expected squared error',
    back: r`\(\mathbb{E}\big[(y - \hat{f}(x))^2\big] = \mathrm{Bias}\big[\hat{f}(x)\big]^2 + \mathrm{Var}\big[\hat{f}(x)\big] + \sigma^2\)`,
    extra: r`\(\sigma^2\) is irreducible noise: no model can remove it.`,
  },
  {
    front: 'Common ways to reduce overfitting',
    back: 'Get more data, simplify the model, add regularization, stop training early, use dropout, augment the data, or drop noisy features',
    extra: 'Early stopping halts training when the validation loss stops improving.',
  },
  // Regularization
  {
    front: 'Regularization',
    back: 'Adding a penalty for model complexity, usually large weights, to the loss so the model is discouraged from fitting noise',
  },
  {
    front: 'L1 vs L2 regularization',
    back: r`L1 (lasso) adds \(\lambda\sum_i |w_i|\) and drives some weights to exactly zero; L2 (ridge) adds \(\lambda\sum_i w_i^2\) and shrinks all weights smoothly`,
    extra: 'L1 doubles as feature selection. Elastic net combines both penalties.',
  },
  {
    front: 'What happens as you increase the regularization strength?',
    back: 'The model gets simpler: variance falls and bias rises. Too much regularization underfits',
    extra:
      'In scikit-learn’s `LogisticRegression` and SVMs, `C` is the inverse of the strength: a smaller `C` means stronger regularization.',
  },
  {
    front: 'Dropout',
    back: 'During training, randomly zeroes a fraction of a layer’s outputs on each step so the network can’t rely on any single neuron; it is switched off at inference',
    extra: 'Typical rates are 0.1 to 0.5.',
  },
  // Training
  {
    front: 'Loss function',
    back: 'A function that measures how far predictions are from the true values; training adjusts the parameters to minimize it',
    extra: 'Mean squared error for regression, cross-entropy (log loss) for classification.',
  },
  { front: 'Mean squared error (MSE)', back: r`\(\mathrm{MSE} = \dfrac{1}{n}\displaystyle\sum_{i=1}^{n} (y_i - \hat{y}_i)^2\)` },
  {
    front: 'Binary cross-entropy (log loss)',
    back: r`\(L = -\dfrac{1}{n}\displaystyle\sum_{i=1}^{n} \big[y_i \log \hat{p}_i + (1 - y_i)\log(1 - \hat{p}_i)\big]\)`,
    extra: 'It punishes confident wrong predictions heavily.',
  },
  {
    front: 'Gradient descent update rule',
    back: r`\(\theta \leftarrow \theta - \eta\,\nabla_\theta L(\theta)\)`,
    extra: r`Each step moves the parameters \(\theta\) against the gradient of the loss; \(\eta\) is the learning rate.`,
  },
  {
    front: 'Learning rate too high vs too low',
    back: 'Too high: updates overshoot, so the loss oscillates or diverges. Too low: training converges very slowly or stalls',
  },
  {
    front: 'Batch vs stochastic vs mini-batch gradient descent',
    back: 'Batch uses the whole dataset for each update, stochastic (SGD) a single example, and mini-batch a small batch such as 32 to 256 examples, the usual compromise',
    extra: 'One epoch is one full pass over the training data.',
  },
  // Common models
  {
    front: 'Linear regression',
    back: r`Predicts a number as a weighted sum of the features plus a bias, \(\hat{y} = w^\top x + b\), fitted by minimizing squared error`,
  },
  {
    front: 'Logistic regression',
    back: r`A classifier that passes a linear score through the sigmoid \(\sigma(z) = \dfrac{1}{1 + e^{-z}}\) to get a probability between 0 and 1`,
    extra: 'Despite the name, it is used for classification.',
  },
  {
    front: 'Decision tree',
    back: 'Splits the data with a sequence of if/else questions on feature values, choosing the splits that best separate the targets',
    extra: 'Easy to interpret, but deep trees overfit; limit `max_depth` or prune them.',
  },
  {
    front: 'Random forest',
    back: 'An ensemble of decision trees, each trained on a bootstrap sample of the data with a random subset of features considered at each split; predictions are averaged or voted',
    extra: 'This is bagging: averaging many independently trained trees reduces variance.',
  },
  {
    front: 'Gradient boosting',
    back: 'Builds trees one after another, each fitting the remaining errors (the loss gradients) of the ensemble so far',
    extra:
      'Boosting mainly reduces bias. XGBoost, LightGBM and CatBoost are popular implementations and often win on tabular data.',
  },
  {
    front: 'k-nearest neighbors (k-NN)',
    back: 'Predicts from the k closest training examples: a majority vote for classification, an average for regression',
    extra: 'There is no real training step, but prediction is slow on large datasets and features must be scaled.',
  },
  {
    front: 'Support vector machine (SVM)',
    back: 'Finds the decision boundary with the widest margin between the classes; kernels such as RBF allow non-linear boundaries',
  },
  {
    front: 'k-means clustering',
    back: 'Unsupervised: picks k centroids, then repeatedly assigns each point to its nearest centroid and moves each centroid to the mean of its points',
    extra: 'You choose k yourself, often with the elbow method or the silhouette score.',
  },
  {
    front: 'Principal component analysis (PCA)',
    back: 'Unsupervised dimensionality reduction that projects the data onto the orthogonal directions of greatest variance',
    extra: 'Used to compress features, speed up training and plot high-dimensional data in 2D.',
  },
  // Features
  {
    front: 'Which models need feature scaling?',
    back: 'Distance- and gradient-based ones: k-NN, k-means, SVMs, neural networks and regularized linear models. Tree-based models don’t need it',
    extra: r`Standardization: \(z = (x - \mu)/\sigma\), with \(\mu\) and \(\sigma\) computed on the training set only.`,
  },
  {
    front: 'One-hot encoding',
    back: 'Turns a categorical feature into one binary column per category, so models don’t read a false order into category codes',
    extra: 'A `color` column with red, green and blue becomes `is_red`, `is_green` and `is_blue`.',
  },
  // Evaluation
  {
    front: 'Confusion matrix',
    back: 'A table of predicted against actual classes, giving the counts of true positives, false positives, true negatives and false negatives',
  },
  {
    front: 'Why can accuracy mislead?',
    back: 'With imbalanced classes a useless model scores high: if 99% of transactions are legitimate, always predicting “legitimate” is 99% accurate and catches no fraud',
  },
  { front: 'Precision', back: r`\(\dfrac{TP}{TP + FP}\): of the items predicted positive, the share that really are positive` },
  {
    front: 'Recall (sensitivity)',
    back: r`\(\dfrac{TP}{TP + FN}\): of the actual positives, the share the model found`,
    extra: 'Also called the true positive rate.',
  },
  {
    front: 'F1 score',
    back: r`The harmonic mean of precision and recall: \(F_1 = \dfrac{2PR}{P + R}\)`,
    extra: 'It is high only when both precision and recall are high.',
  },
  {
    front: 'Cancer screening vs spam filter: favor precision or recall?',
    back: 'Screening favors recall, because a missed case is costly; a spam filter favors precision, because losing a real email to the spam folder is costly',
    extra: 'Raising the decision threshold usually increases precision and lowers recall.',
  },
  {
    front: 'ROC curve and ROC-AUC',
    back: 'The ROC curve plots the true positive rate against the false positive rate across all thresholds; AUC is the area under it, where 0.5 means random guessing and 1.0 a perfect ranking',
    extra:
      'AUC equals the probability that a random positive is ranked above a random negative. On heavily imbalanced data, the precision-recall curve is often more informative.',
  },
  {
    front: 'k-fold cross-validation',
    back: 'Split the data into k folds, train on k − 1 of them and validate on the remaining one, rotate k times, then average the scores',
    extra: py(
      'from sklearn.model_selection import cross_val_score',
      '',
      'scores = cross_val_score(model, X, y, cv=5, scoring="f1")',
    ),
  },
  {
    front: 'MAE vs RMSE',
    back: 'Both measure regression error in the target’s units; RMSE squares errors before averaging, so it penalizes large errors more than MAE does',
  },
  // Neural networks
  {
    front: 'What does a single artificial neuron compute?',
    back: r`A weighted sum of its inputs plus a bias, passed through an activation function: \(a = f(w^\top x + b)\)`,
  },
  {
    front: 'Why do neural networks need non-linear activation functions?',
    back: 'Without them, any stack of layers collapses into a single linear function, so extra layers add nothing',
    extra: r`ReLU, \(\max(0, x)\), is the usual default for hidden layers.`,
  },
  {
    front: 'Backpropagation',
    back: 'Computes the gradient of the loss with respect to every weight by applying the chain rule backward from the output layer; an optimizer such as SGD or Adam then updates the weights',
  },
  {
    front: 'Softmax',
    back: r`Turns a vector of scores (logits) into probabilities that sum to 1: \(\mathrm{softmax}(z)_i = \dfrac{e^{z_i}}{\sum_j e^{z_j}}\)`,
    extra: 'Used in the output layer of multi-class classifiers.',
  },
]

export const MACHINE_LEARNING: PublicDeck = {
  slug: 'machine-learning',
  title: 'Machine learning basics: 50 cards on models, training and metrics',
  shortTitle: 'Machine learning',
  category: 'data-ai',
  level: 'beginner',
  icon: 'brain',
  description:
    'Machine learning flashcards: supervised vs unsupervised learning, overfitting, bias-variance, regularization, gradient descent, common models and metrics.',
  intro:
    'Fifty cards on the machine learning fundamentals every course and interview starts with: how data is split and how it leaks, why models overfit and how regularization helps, how gradient descent trains them, what linear models, trees, ensembles, k-NN and k-means actually do, and how to judge a model with precision, recall, F1, ROC-AUC and cross-validation. Formulas are rendered in LaTeX and code examples use scikit-learn.',
  faq: [
    {
      q: 'Do I need a lot of math for this deck?',
      a: 'Basic algebra is enough for most cards. A few formulas, such as the gradient descent update and log loss, are shown in LaTeX next to a plain-language explanation.',
    },
    {
      q: 'Does it cover deep learning?',
      a: 'Only the basics: neurons, activation functions, backpropagation, softmax and dropout. The focus is on concepts that apply to every model, from linear regression to neural networks.',
    },
    {
      q: 'Which library do the code examples use?',
      a: 'scikit-learn, the standard Python library for classic machine learning. The ideas carry over to any framework.',
    },
    {
      q: 'Is it useful for data science interviews?',
      a: 'Yes. Overfitting, the bias-variance tradeoff, precision vs recall, ROC-AUC and cross-validation are among the most common interview questions.',
    },
  ],
  cards: CARDS,
}
